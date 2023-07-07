import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

type InputProps = {
  label: string;
  error:
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<any>>
    | Merge<FieldError, (FieldError | undefined)[]>
    | undefined;
  children: React.ReactElement;
};

export function Input({ label, error, children }: InputProps) {
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      {children}

      <label
        className="label h-2 pt-5"
        style={{ visibility: error ? "visible" : "hidden" }}
      >
        <span className="label-text-alt text-red-800">
          {error && error.message?.toString()}
        </span>
      </label>
    </div>
  );
}
