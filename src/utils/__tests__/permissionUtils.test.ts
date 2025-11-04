import { describe, it, expect } from 'vitest';
import {
  extractApiUrl,
  generatePermissionPoint,
  parseSwaggerToPermissionGroups
} from '../permissionUtils';

describe('permissionUtils', () => {
  describe('extractApiUrl', () => {
    it('should extract API URL from v1 path', () => {
      const url = '/api/saas/v1/demo/user/queryList';
      const result = extractApiUrl(url);
      expect(result).toBe('/demo/user/queryList');
    });

    it('should extract API URL from api path when no v1', () => {
      const url = '/api/demo/user/queryList';
      const result = extractApiUrl(url);
      expect(result).toBe('/demo/user/queryList');
    });

    it('should return original URL when no patterns match', () => {
      const url = '/custom/path';
      const result = extractApiUrl(url);
      expect(result).toBe('/custom/path');
    });

    it('should ensure URL starts with /', () => {
      const url = 'api/demo/user/queryList';
      const result = extractApiUrl(url);
      expect(result).toBe('/api/demo/user/queryList');
    });

    it('should handle URL without leading slash after extraction', () => {
      const url = '/api/saas/v1/demo/user/queryList';
      const result = extractApiUrl(url);
      expect(result).toBe('/demo/user/queryList');
    });
  });

  describe('generatePermissionPoint', () => {
    it('should generate correct permission point', () => {
      const authPointKey = 'demo-user-management-queryList';
      const apiUrl = '/api/saas/v1/demo/user/queryList';
      const apiName = '获取用户列表';
      const parentAuthPointKey = 'GEN_PAGE_TODO_请填写父节点-authPointKey';

      const result = generatePermissionPoint(authPointKey, apiUrl, apiName, parentAuthPointKey);

      expect(result).toEqual({
        parentAuthPointKey: 'GEN_PAGE_TODO_请填写父节点-authPointKey',
        authPointApiUrl: '/demo/user/queryList',
        authPointKey: 'demo-user-management-queryList',
        authPointName: '获取用户列表',
        type: '权限点',
        priority: null,
        children: null,
        desc: '',
        menuPath: '',
        prefixPath: '',
        systemDomain: ''
      });
    });
  });

  describe('parseSwaggerToPermissionGroups', () => {
    it('should parse swagger data to permission groups', () => {
      const swaggerData = {
        paths: {
          '/api/saas/v1/demo/user/queryList': {
            get: {
              summary: '获取用户列表',
              'x-apifox-fe-general-model-base-action-type': 'demo.user.management'
            }
          },
          '/api/saas/v1/demo/user/create': {
            post: {
              summary: '创建用户',
              'x-apifox-fe-general-model-base-action-type': 'demo.user.management'
            }
          },
          '/api/saas/v1/order/list': {
            get: {
              summary: '获取订单列表',
              'x-apifox-fe-general-model-base-action-type': 'order.management'
            }
          }
        }
      };

      const result = parseSwaggerToPermissionGroups(swaggerData);

      expect(result).toHaveLength(2);
      expect(result[0].groupName).toBe('demo.user.management');
      expect(result[0].apis).toHaveLength(2);
      expect(result[1].groupName).toBe('order.management');
      expect(result[1].apis).toHaveLength(1);
    });

    it('should use default group when no action type', () => {
      const swaggerData = {
        paths: {
          '/api/saas/v1/demo/user/queryList': {
            get: {
              summary: '获取用户列表'
            }
          }
        }
      };

      const result = parseSwaggerToPermissionGroups(swaggerData);

      expect(result).toHaveLength(1);
      expect(result[0].groupName).toBe('demo.default');
    });
  });
});
