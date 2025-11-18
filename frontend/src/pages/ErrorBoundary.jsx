import { Component } from "react";
import ErrorPage from "./Error";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return <ErrorPage error={this.state.error} />;
        }
        return this.props.children;
    }
}