import React, { useState } from 'react';
import { Button } from "antd"
import { CopyOutlined } from '@ant-design/icons';
import { ApiConfig } from '@src/types';
import { generatePermissionPointsFromApiConfigs } from '@src/utils/permissionUtils';
import CopyPermissionModal from '../../CopyPermissionModal';

interface CopyPermissionButtonProps {
  apiConfig: ApiConfig
}

const CopyPermissionButton: React.FC<CopyPermissionButtonProps> = ({
  apiConfig,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const handleCopyPermission = () => {
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const permissionPoints = generatePermissionPointsFromApiConfigs(
    [apiConfig],
    ""
  )

  return (
    <>
      <Button
        type="link"
        size="small"
        icon={<CopyOutlined />}
        onClick={handleCopyPermission}
        title="复制权限点"
      >
        复制权限点
      </Button>
      
      <CopyPermissionModal
        visible={modalVisible}
        onCancel={handleModalCancel}
        permissionPoints={permissionPoints}
        title="复制单个权限点"
      />
    </>
  );
};

export default CopyPermissionButton;
