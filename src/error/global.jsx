import { Component } from "react";
import CrashBoard from "@/components/common/CrashBoard/CrashBoard";

export default class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("Crash:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <CrashBoard />;
    }
    return this.props.children;
  }
}
