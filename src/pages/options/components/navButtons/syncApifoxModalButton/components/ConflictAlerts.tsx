import React from "react"
import { Alert } from "antd"

interface ConflictAlertsProps {
  urlConflicts: string[]
  groupConflicts: string[]
}

const ConflictAlerts: React.FC<ConflictAlertsProps> = ({
  urlConflicts,
  groupConflicts,
}) => {
  return (
    <>
      {urlConflicts.length > 0 && (
        <Alert
          message="URL冲突"
          description={
            <div>
              <p>以下接口URL已存在：</p>
              <ul className="list-disc list-inside">
                {urlConflicts.map((conflict, index) => (
                  <li key={index} className="text-red-600">
                    {conflict}
                  </li>
                ))}
              </ul>
            </div>
          }
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      {groupConflicts.length > 0 && (
        <Alert
          message="分组名冲突"
          description={
            <div>
              <p>以下分组名已存在：</p>
              <ul className="list-disc list-inside">
                {groupConflicts.map((conflict, index) => (
                  <li key={index} className="text-red-600">
                    {conflict}
                  </li>
                ))}
              </ul>
            </div>
          }
          type="warning"
          showIcon
          className="mb-4"
        />
      )}
    </>
  )
}

export default ConflictAlerts
