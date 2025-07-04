import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import type { FeatureConfig } from '@/hooks/useGlobalConfig';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useGlobalConfig } from '@/hooks/useGlobalConfig';

const BELLA_WORKFLOW_FEATURE_KEY = 'bellaWorkflow';

interface BellaConfigFormData {
  bellaUrl: string;
  apiKey: string;
  tenantId: string;
  workflowId: string;
  userId: string;
}

export function useBellaConfig() {
  const { getFeatureConfig, setFeatureConfig, clearFeatureConfig, isLoading: isConfigLoading } = useGlobalConfig();
  const [config, setConfig] = useState<BellaConfigFormData | null>(null);

  useEffect(() => {
    if (!isConfigLoading) {
      const existingConfig = getFeatureConfig(BELLA_WORKFLOW_FEATURE_KEY);
      setConfig(existingConfig as unknown as BellaConfigFormData);
    }
  }, [isConfigLoading, getFeatureConfig]);

  const saveConfig = async (data: BellaConfigFormData) => {
    await setFeatureConfig(BELLA_WORKFLOW_FEATURE_KEY, data as unknown as FeatureConfig);
  };

  const clearConfig = async () => {
    await clearFeatureConfig(BELLA_WORKFLOW_FEATURE_KEY);
    setConfig(null); // Clear local state after clearing global config
  };

  return {
    config,
    saveConfig,
    clearConfig,
    isConfigLoading,
  };
}

function BellaConfigForm() {
  const { config, saveConfig, clearConfig, isConfigLoading } = useBellaConfig();
  const { handleSubmit, reset, formState: { isSubmitting }, control } = useForm<BellaConfigFormData>();

  useEffect(() => {
    if (config) {
      reset(config);
    }
  }, [config, reset]);

  const onSubmit = async (data: BellaConfigFormData) => {
    await saveConfig(data);
  };

  const onClear = async () => {
    await clearConfig();
    reset({}); // Reset form fields after clearing
  };

  if (isConfigLoading) {
    return (
      <div className="flex items-center justify-center p-8 border rounded-md">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-md">
      <h4 className="font-medium text-lg">Bella Workflow 配置</h4>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="bellaUrl" className="text-right">
          Bella URL
        </Label>
        <Controller
          name="bellaUrl"
          control={control}
          render={({ field }) => (
            <Input id="bellaUrl" placeholder="请输入Bella服务URL" className="col-span-3" {...field} />
          )}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="apiKey" className="text-right">
          API Key
        </Label>
        <Controller
          name="apiKey"
          control={control}
          render={({ field }) => (
            <Input id="apiKey" placeholder="请输入API Key" className="col-span-3" {...field} />
          )}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="tenantId" className="text-right">
          Tenant ID
        </Label>
        <Controller
          name="tenantId"
          control={control}
          render={({ field }) => (
            <Input id="tenantId" placeholder="请输入Tenant ID" className="col-span-3" {...field} />
          )}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="workflowId" className="text-right">
          Workflow ID
        </Label>
        <Controller
          name="workflowId"
          control={control}
          render={({ field }) => (
            <Input id="workflowId" placeholder="请输入Workflow ID" className="col-span-3" {...field} />
          )}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="userId" className="text-right">
          User ID
        </Label>
        <Controller
          name="userId"
          control={control}
          render={({ field }) => (
            <Input id="userId" placeholder="请输入User ID" className="col-span-3" {...field} />
          )}
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onClear} disabled={isSubmitting}>
          清空
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
        </Button>
      </div>
    </form>
  );
}

export function useConfigModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal,
  };
}

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>配置</DialogTitle>
          <DialogDescription>
            在这里配置请求拦截器的相关设置。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <BellaConfigForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
