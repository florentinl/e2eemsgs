import { Alert } from "@mui/material";

type InfoBoxProps = {
    show: boolean; // Should the box appear
    isError: boolean; // Is it error or success (red or green)
    content: string; // Info text
};

export default function InfoBox({
    show,
    isError,
    content,
  }: InfoBoxProps) {
    const severity = isError ? "error" : "success"
    if (show) {
    return (
        <Alert severity={severity} >{content}</Alert>)
    } else {
    return (
        <></>)
    }}