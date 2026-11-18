import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * Catches render crashes (e.g. unexpected null from Supabase-shaped data)
 * so the shell never blanks out.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[tariq] ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="mx-auto max-w-lg px-4 py-16 text-center"
          role="alert"
          dir="rtl"
        >
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            حدث خطأ غير متوقع
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            تعذر عرض هذا الجزء مؤقتاً. حدّث الصفحة للمحاولة من جديد.
          </p>
          <button
            type="button"
            className="brand-gradient mt-6 inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            تحديث الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
