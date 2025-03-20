'use client';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col gap-4 bg-[#fff] dark:bg-background items-center justify-center backdrop-blur-sm">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary/30 rounded-full" />
        <div className="absolute top-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-sm text-primary/70 animate-pulse">加载中...</p>
    </div>
  );
}
