import React from "react"
import { Button, ConfigProvider } from "antd"
import type { ButtonProps } from "antd/es/button"

interface ColorButtonProps extends Omit<ButtonProps, "color"> {
  color?: string
}

const ColorButton: React.FC<ColorButtonProps> = ({
  color = "#1890ff",
  children,
  type = "primary",
  ...restProps
}) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: color,
        },
      }}
    >
      <Button type={type} {...restProps}>
        {children}
      </Button>
    </ConfigProvider>
  )
}

export default ColorButton
