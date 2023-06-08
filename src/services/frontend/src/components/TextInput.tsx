import { useFormContext } from "react-hook-form";

type TextInputProps = {
  label: string;
  name: string;
  type?: string;
};

export default function TextInput({
  label,
  name,
  type = "text",
}: TextInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = errors[name]?.message?.toString();

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        type={type}
        {...register(name)}
        className="input-bordered input w-full"
      />

      <label
        className="label h-2 pt-5"
        style={{ visibility: errors[name] ? "visible" : "hidden" }}
      >
        <span className="label-text-alt text-red-800">{errorMessage}</span>
      </label>
    </div>
  );
}
