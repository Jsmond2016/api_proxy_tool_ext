import packageJson from "../../package.json"
import {
  LOG_MESSAGES,
  ERROR_MESSAGES,
  CONSOLE_STYLES,
} from "../constant/constant"

/**
 * 日志工具类
 */
export class Logger {
  /**
   * 输出扩展初始化信息
   */
  static logExtensionInfo(): void {
    console.log(
      `%c${LOG_MESSAGES.EXTENSION_TITLE} %c| %c${LOG_MESSAGES.EXTENSION_VERSION}: v${packageJson.version} %c| %c${LOG_MESSAGES.EXTENSION_AUTHOR}`,
      CONSOLE_STYLES.PRIMARY,
      CONSOLE_STYLES.SECONDARY,
      CONSOLE_STYLES.SUCCESS,
      CONSOLE_STYLES.SECONDARY,
      "color: #722ed1; font-weight: bold;"
    )
    console.log(
      `%c${LOG_MESSAGES.GITHUB_LABEL}: %c${LOG_MESSAGES.GITHUB_URL}`,
      CONSOLE_STYLES.SECONDARY,
      CONSOLE_STYLES.LINK
    )
    console.log(
      `%c${LOG_MESSAGES.CHROME_STORE_LABEL}: %c${LOG_MESSAGES.CHROME_STORE_URL}`,
      CONSOLE_STYLES.SECONDARY,
      CONSOLE_STYLES.LINK
    )
    console.log(
      `%c${LOG_MESSAGES.EDGE_STORE_LABEL}: %c${LOG_MESSAGES.EDGE_STORE_URL}`,
      CONSOLE_STYLES.SECONDARY,
      CONSOLE_STYLES.LINK
    )
    console.log(`%c${LOG_MESSAGES.INIT_SUCCESS}`, CONSOLE_STYLES.SUCCESS)
  }

  /**
   * 输出信息日志
   * @param message 消息内容
   */
  static info(message: string): void {
    console.log(message)
  }

  /**
   * 输出错误日志
   * @param message 错误消息
   * @param error 错误对象
   */
  static error(message: string, error?: unknown): void {
    console.error(message, error)
  }

  /**
   * 输出错误详情
   * @param label 标签
   * @param error 错误对象
   */
  static errorDetails(label: string, error: unknown): void {
    console.error(
      label,
      error instanceof Error ? error.message : String(error)
    )
  }
}

