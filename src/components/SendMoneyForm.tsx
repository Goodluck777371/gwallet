
// Add the initialRecipient prop to the component props
export interface SendMoneyFormProps {
  onSuccess: () => void;
  initialRecipient?: string;
}
