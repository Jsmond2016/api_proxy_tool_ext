#!/usr/bin/env node
/**
 * Regenerate CHANGELOG.md from scratch
 *
 * Uses the actual commit history on the main branch (HEAD's ancestry) to
 * correctly map each version tag to the corresponding commit on the main branch,
 * avoiding issues caused by duplicate release commits from CI/alternate authors.
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const REPO = 'https://github.com/Jsmond2016/api_proxy_tool_ext';
const FORK_LAST_TAG = 'v1.0.3'; // Last tag from the original fork project

// Get all release commits on the main branch (ancestors of HEAD)
// with their version number, in chronological order (oldest first)
function getReleaseVersions() {
  const output = execSync(
    "git log --no-merges HEAD --format='%H|%ad|%s' --date=short --grep='chore(release):'",
    { encoding: 'utf8' }
  );

  return output.trim().split('\n').filter(Boolean)
    .map(line => {
      const [hash, date, ...rest] = line.split('|');
      const subject = rest.join('|');
      // Extract version from "chore(release): v1.2.0" or "chore(release): 1.2.0"
      const versionMatch = subject.match(/(\d+\.\d+\.\d+)/);
      const version = versionMatch ? versionMatch[1] : null;
      return { hash, date, version };
    })
    .filter(v => v.version !== null && v.version.startsWith('1.'));
}

// Sort versions semantically, from oldest to newest
function sortVersions(versions) {
  return versions.sort((a, b) => {
    const pa = a.version.split('.').map(Number);
    const pb = b.version.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if (pa[i] !== pb[i]) return pa[i] - pb[i];
    }
    return 0;
  });
}

// Get commits between two version commits
function getCommitsBetween(fromHash, toHash) {
  const range = fromHash ? `${fromHash}..${toHash}` : toHash;
  try {
    const output = execSync(
      `git log --no-merges --format='%H|%s' ${range}`,
      { encoding: 'utf8' }
    );
    return output.trim().split('\n').filter(Boolean).map(line => {
      const [hash, ...subjectParts] = line.split('|');
      return { hash: hash.trim(), subject: subjectParts.join('|') };
    });
  } catch {
    return [];
  }
}

// Parse conventional commit message
function parseCommit(subject) {
  const match = subject.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/);
  if (match) {
    return {
      type: match[1],
      scope: match[2] || '',
      description: match[3],
    };
  }
  return { type: 'other', scope: '', description: subject };
}

// Map conventional commit type to changelog group header
function typeToHeader(type) {
  const map = {
    feat: 'Features',
    fix: 'Bug Fixes',
    refactor: 'Code Refactoring',
    docs: 'Documentation',
    style: 'Styles',
    chore: 'Chores',
    test: 'Tests',
    perf: 'Performance Improvements',
    build: 'Build System',
    ci: 'Continuous Integration',
  };
  return map[type] || null;
}

// Group commits by type
function groupByType(commits) {
  const groups = {};
  for (const commit of commits) {
    // skip chore(release): commits - they are already represented by the version header
    if (/^chore\(release\):\s/.test(commit.subject)) continue;

    const parsed = parseCommit(commit.subject);
    const header = typeToHeader(parsed.type);
    if (!header) continue; // skip non-conventional commits

    if (!groups[header]) groups[header] = [];
    groups[header].push({
      scope: parsed.scope,
      description: parsed.description,
      hash: commit.hash,
    });
  }
  return groups;
}

// Format a commit as a markdown list item
function formatCommit(commit) {
  const scope = commit.scope ? `**${commit.scope}:** ` : '';
  const shortHash = commit.hash.slice(0, 7);
  return `* ${scope}${commit.description} ([${shortHash}](${REPO}/commit/${commit.hash}))`;
}

// Format version header
function formatVersionHeader(version, prevVersion, date) {
  const prevRef = prevVersion ? `v${prevVersion}` : FORK_LAST_TAG;
  return `## [${version}](${REPO}/compare/${prevRef}...v${version}) (${date})`;
}

// Main generation
function generate() {
  const releaseVersions = getReleaseVersions();
  const sorted = sortVersions(releaseVersions);

  // Deduplicate by version number (keep the first occurrence = oldest chronologically)
  const seen = new Set();
  const uniqueVersions = sorted.filter(v => {
    if (seen.has(v.version)) return false;
    seen.add(v.version);
    return true;
  });

  console.log(`Found ${uniqueVersions.length} versions, generating changelog...`);

  const sections = [];

  // Generate sections for each tagged version (in chronological order)
  for (let i = 0; i < uniqueVersions.length; i++) {
    const curr = uniqueVersions[i];
    const prev = i === 0 ? null : uniqueVersions[i - 1];

    // For first version (v1.2.0), base from the last fork tag
    const fromHash = i === 0 ? FORK_LAST_TAG : prev.hash;
    const commits = getCommitsBetween(fromHash, curr.hash);

    // But for v1.2.0, also exclude old fork commits by filtering to
    // only include commits that are descendants of FORK_LAST_TAG
    const filteredCommits = i === 0
      ? commits.filter(c => {
          // For v1.2.0, skip commits that are also in the fork history
          const isForkCommit = execSync(
            `git merge-base --is-ancestor ${c.hash} ${FORK_LAST_TAG} 2>/dev/null && echo true || echo false`,
            { encoding: 'utf8' }
          ).trim() === 'true';
          return !isForkCommit;
        })
      : commits;

    const grouped = groupByType(filteredCommits);
    const groups = Object.keys(grouped);
    if (groups.length === 0) continue;

    let block = `${formatVersionHeader(curr.version, prev ? prev.version : null, curr.date)}\n\n`;
    for (const header of groups) {
      block += `### ${header}\n\n`;
      for (const commit of grouped[header]) {
        block += formatCommit(commit) + '\n';
      }
      block += '\n';
    }
    sections.push(block);
  }

  // Generate section for current HEAD (untagged - latest commits)
  const lastVersion = uniqueVersions[uniqueVersions.length - 1];
  const headCommits = getCommitsBetween(lastVersion.hash, 'HEAD');

  if (headCommits.length > 0) {
    const grouped = groupByType(headCommits);
    const groups = Object.keys(grouped);
    if (groups.length > 0) {
      const date = execSync("git log -1 --format='%ad' --date=short HEAD", { encoding: 'utf8' }).trim();
      const nextVersion = bumpPatch(lastVersion.version);
      let block = `${formatVersionHeader(nextVersion, lastVersion.version, date)}\n\n`;
      for (const header of groups) {
        block += `### ${header}\n\n`;
        for (const commit of grouped[header]) {
          block += formatCommit(commit) + '\n';
        }
        block += '\n';
      }
      sections.push(block);
    }
  }

  // Reverse to show newest first
  return sections.reverse().join('');
}

function bumpPatch(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

const changelog = generate();
writeFileSync('CHANGELOG.md', changelog, 'utf8');
const versionCount = (changelog.match(/^## \[/gm) || []).length;
const sizeKB = (changelog.length / 1024).toFixed(1);
console.log(`✓ CHANGELOG.md regenerated — ${versionCount} versions, ${sizeKB} KB`);
