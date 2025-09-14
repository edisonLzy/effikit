import type { DifyWorkflow, DifyWorkflowRequest, DifyWorkflowResponse } from '@/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('DifyService');

// Dify API 基础配置
const DIFY_API_BASE_URL = 'https://api.dify.ai/v1/workflows/run';

/**
 * Dify API 服务类
 */
export class DifyService {
  /**
   * 调用 Dify 工作流
   * @param workflow 工作流配置
   * @param content 高亮的内容
   * @param references 当前网页的地址
   * @param user 用户标识
   * @returns Promise<DifyWorkflowResponse>
   */
  static async callWorkflow(
    workflow: DifyWorkflow,
    content: string,
    references: string,
    user: string = 'effikit-user'
  ): Promise<DifyWorkflowResponse> {
    logger.info('Calling Dify workflow:', {
      workflowKey: workflow.key,
      contentLength: content.length,
      references
    });

    const requestBody: DifyWorkflowRequest = {
      inputs: {
        content,
        references,
        user
      },
      response_mode: 'blocking',
      user
    };

    try {
      const response = await fetch(DIFY_API_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${workflow.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dify API 调用失败: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result: DifyWorkflowResponse = await response.json();

      logger.info('Dify workflow called successfully:', {
        workflowRunId: result.workflow_run_id,
        status: result.data?.status
      });

      return result;
    } catch (error) {
      logger.error('Error calling Dify workflow:', error);

      // 重新抛出更友好的错误信息
      if (error instanceof Error) {
        throw new Error(`调用 Dify 工作流失败: ${error.message}`);
      }
      throw new Error('调用 Dify 工作流时发生未知错误');
    }
  }

  /**
   * 调用"保存内容到飞书"工作流
   * @param workflow 工作流配置
   * @param content 高亮的内容
   * @param references 当前网页的地址
   * @returns Promise<boolean> 是否成功
   */
  static async saveToFeishu(
    workflow: DifyWorkflow,
    content: string,
    references: string
  ): Promise<boolean> {
    try {
      const result = await this.callWorkflow(workflow, content, references, 'feishu-daily-note');

      // 检查工作流是否成功执行
      if (result.data?.status === 'succeeded') {
        logger.info('Content saved to Feishu successfully');
        return true;
      } else {
        logger.warn('Dify workflow completed but status is not succeeded:', result.data?.status);
        return false;
      }
    } catch (error) {
      logger.error('Failed to save to Feishu:', error);
      throw error;
    }
  }

  /**
   * 验证工作流配置
   * @param workflow 工作流配置
   * @returns Promise<boolean> 配置是否有效
   */
  static async validateWorkflow(workflow: DifyWorkflow): Promise<boolean> {
    try {
      // 使用简单的测试内容验证工作流
      await this.callWorkflow(workflow, 'test', 'https://example.com');
      return true;
    } catch (error) {
      logger.error('Workflow validation failed:', error);
      return false;
    }
  }
}

/**
 * 获取配置的"保存内容到飞书"工作流
 * 这个函数从全局配置中查找标题为"保存内容到飞书"的工作流
 */
export async function getFeishuWorkflow(): Promise<DifyWorkflow | null> {
  return new Promise((resolve) => {
    if (!chrome.storage) {
      resolve(null);
      return;
    }

    chrome.storage.sync.get('effikit_global_config', (result) => {
      if (chrome.runtime.lastError) {
        logger.error('Failed to get config:', chrome.runtime.lastError);
        resolve(null);
        return;
      }

      const globalConfig = result.effikit_global_config || {};
      const difyConfig = globalConfig.dify || {};
      const workflows: DifyWorkflow[] = difyConfig.workflows || [];

      // 查找标题为"保存内容到飞书"的工作流
      const feishuWorkflow = workflows.find(w => w.key === 'feishu-daily-note');
      resolve(feishuWorkflow || null);
    });
  });
}