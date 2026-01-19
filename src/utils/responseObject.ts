interface responseProps {
  message: string;
  status: number;
  success: boolean;
  data: {};
}

export default function response({
  message = "default message",
  status,
  success,
  data,
}: responseProps) {
  return {
    message,
    status,
    success,
    data,
  };
}
