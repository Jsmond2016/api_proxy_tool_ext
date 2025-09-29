#!/bin/bash

# Generate Changelog Script
# This script generates a changelog from git commit history

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to generate changelog
generate_changelog() {
    local version=$1
    local previous_tag=$2
    
    print_info "Generating changelog for version: $version"
    
    # Get commits between tags
    if [ -z "$previous_tag" ]; then
        print_info "No previous tag found, generating changelog from beginning"
        commits=$(git log --pretty=format:"- %s" --no-merges)
    else
        print_info "Generating changelog from $previous_tag to v$version"
        commits=$(git log $previous_tag..HEAD --pretty=format:"- %s" --no-merges)
    fi
    
    # Categorize commits using temporary files
    echo "$commits" > /tmp/commits.txt
    
    features=""
    fixes=""
    chores=""
    docs=""
    other=""
    
    while IFS= read -r commit; do
        if echo "$commit" | grep -q "^\- feat"; then
            features="${features}${commit}"$'\n'
        elif echo "$commit" | grep -q "^\- fix"; then
            fixes="${fixes}${commit}"$'\n'
        elif echo "$commit" | grep -q "^\- chore"; then
            chores="${chores}${commit}"$'\n'
        elif echo "$commit" | grep -q "^\- docs"; then
            docs="${docs}${commit}"$'\n'
        else
            other="${other}${commit}"$'\n'
        fi
    done < /tmp/commits.txt
    
    rm -f /tmp/commits.txt
    
    # Build changelog
    changelog=""
    
    if [ -n "$features" ]; then
        changelog="${changelog}### ✨ Features"$'\n'"$features"$'\n'
    fi
    
    if [ -n "$fixes" ]; then
        changelog="${changelog}### 🐛 Bug Fixes"$'\n'"$fixes"$'\n'
    fi
    
    if [ -n "$chores" ]; then
        changelog="${changelog}### 🔧 Maintenance"$'\n'"$chores"$'\n'
    fi
    
    if [ -n "$docs" ]; then
        changelog="${changelog}### 📚 Documentation"$'\n'"$docs"$'\n'
    fi
    
    if [ -n "$other" ]; then
        changelog="${changelog}### 📝 Other Changes"$'\n'"$other"$'\n'
    fi
    
    # If no changes, add default message
    if [ -z "$changelog" ]; then
        changelog="### 📝 Changes"$'\n'"- General improvements and bug fixes"$'\n'
    fi
    
    echo "$changelog"
}

# Function to update CHANGELOG.md
update_changelog_file() {
    local version=$1
    local changelog_content=$2
    
    print_info "Updating CHANGELOG.md for version: $version"
    
    # Get the date of the commit for this specific version
    # Try to find the commit with the release message first
    release_commit=$(git log --grep="chore(release): $version" --oneline -1 | cut -d' ' -f1)
    if [ -n "$release_commit" ]; then
        current_date=$(git log -1 --date=short --pretty=format:"%ad" $release_commit)
    else
        # Fallback to latest commit date
        current_date=$(git log -1 --date=short --pretty=format:"%ad" HEAD)
    fi
    
    # Create new changelog entry
    new_entry="## [$version] - $current_date"$'\n'$'\n'"$changelog_content"$'\n'
    
    # Read existing CHANGELOG.md
    if [ -f "CHANGELOG.md" ]; then
        # Insert new version after "## [Unreleased]"
        if grep -q "## \[Unreleased\]" CHANGELOG.md; then
            # Create a temporary file with the new entry
            echo "$new_entry" > /tmp/new_entry.txt
            
            # Use a simpler approach
            {
                head -n 1 CHANGELOG.md
                echo ""
                cat /tmp/new_entry.txt
                tail -n +2 CHANGELOG.md
            } > CHANGELOG.md.tmp
            mv CHANGELOG.md.tmp CHANGELOG.md
            rm -f /tmp/new_entry.txt
        else
            # If no [Unreleased] section, add at the top
            echo -e "$new_entry\n$(cat CHANGELOG.md)" > CHANGELOG.md.tmp
            mv CHANGELOG.md.tmp CHANGELOG.md
        fi
    else
        # If file doesn't exist, create new one
        cat > CHANGELOG.md << EOF
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

$new_entry
EOF
    fi
    
    print_success "CHANGELOG.md updated successfully"
}

# Main function
main() {
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi
    
    # Get version from package.json or argument
    if [ -n "$1" ]; then
        version=$1
    else
        version=$(node -p "require('./package.json').version")
    fi
    
    # Get previous tag
    previous_tag=$(git describe --tags --abbrev=0 HEAD~1 2>/dev/null || echo "")
    
    # Generate changelog
    changelog_content=$(generate_changelog "$version" "$previous_tag")
    
    # Print changelog
    echo "Generated Changelog:"
    echo "==================="
    echo "$changelog_content"
    
    # Ask if user wants to update CHANGELOG.md
    if [ "$2" = "--update" ] || [ "$2" = "-u" ]; then
        update_changelog_file "$version" "$changelog_content"
    else
        echo ""
        print_info "To update CHANGELOG.md, run: $0 $version --update"
    fi
}

# Run main function with all arguments
main "$@"