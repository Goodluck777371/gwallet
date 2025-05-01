
// Add the initialRecipient prop to the component props
export interface SendMoneyFormProps {
  onSuccess: () => void;
  initialRecipient?: string;
}

export const SendMoneyForm = ({ onSuccess, initialRecipient = '' }: SendMoneyFormProps) => {
  // Implementation of SendMoneyForm component
  return (
    <div>
      {/* SendMoneyForm implementation */}
      <p>Send Money Form (with initialRecipient: {initialRecipient})</p>
    </div>
  );
};
