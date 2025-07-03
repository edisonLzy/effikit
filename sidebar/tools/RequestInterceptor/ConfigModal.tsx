import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

function BellaConfigForm() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    console.log('Saving Bella Workflow configuration:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-md">
      <h4 className="font-medium text-lg">Bella Workflow 配置</h4>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="bellaUrl" className="text-right">
          Bella URL
        </Label>
        <Input id="bellaUrl" {...register('bellaUrl')} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="apiKey" className="text-right">
          API Key
        </Label>
        <Input id="apiKey" {...register('apiKey')} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="tenantId" className="text-right">
          Tenant ID
        </Label>
        <Input id="tenantId" {...register('tenantId')} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="workflowId" className="text-right">
          Workflow ID
        </Label>
        <Input id="workflowId" {...register('workflowId')} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="userId" className="text-right">
          User ID
        </Label>
        <Input id="userId" {...register('userId')} className="col-span-3" />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={() => reset()}>
          清空
        </Button>
        <Button type="submit">保存</Button>
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
