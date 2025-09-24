import { CopyOutlined } from "@ant-design/icons"
import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import { ApiConfig } from "@src/types"
import { generateId } from "@src/utils/chromeApi"
import { saveConfig } from "@src/utils/configUtil"
import { Button } from "antd"

const CloneButton = ({ apiId }: { apiId: string }) => {
  const { config, setConfig } = useConfigStore()
  const activeModuleId = useActiveModuleIdStore((conf) => conf.activeModuleId)

  // 克隆API
  const handleCloneApi = ()=> {
    const api = config.modules
      .flatMap((module) => module.apiArr)
      .find((api) => api.id === apiId)

    if (api) {
      const clonedApi: ApiConfig = {
        ...api,
        id: generateId(),
        apiName: `${api.apiName}_副本`,
      }

      const newConfig = {
        ...config,
        modules: config.modules.map((module) =>
          module.id === activeModuleId
            ? { ...module, apiArr: [...module.apiArr, clonedApi] }
            : module
        ),
      }

      setConfig(newConfig)
      saveConfig(newConfig)
    }
  }

  return (
    <Button
      type="link"
      className="p-0"
      icon={<CopyOutlined />}
      onClick={handleCloneApi}
    >
      克隆
    </Button>
  )
}

export default CloneButton
