import { useState } from "react";
import {
  FieldValues,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormReset,
} from "react-hook-form";
import { AiOutlineExclamationCircle, AiOutlineSave } from "react-icons/ai";

type SaveIdle = { kind: "save-idle" };

type SavePending = { kind: "save-pending" };

type SaveRejected = { kind: "save-rejected"; errorMessage: string };

type SaveFulfilled = { kind: "save-fulfilled" };

type SaveState = SaveIdle | SavePending | SaveRejected | SaveFulfilled;

type ModalProps<T extends FieldValues> = {
  save: (data: T) => Promise<void>;
  children: React.ReactNode;
  reset: UseFormReset<T>;
  handleSubmit: UseFormHandleSubmit<FieldValues, undefined>;
};

export function Modal<T extends FieldValues>({
  save,
  children,
  reset,
  handleSubmit,
}: ModalProps<T>) {
  const [saveState, setSaveState] = useState<SaveState>({ kind: "save-idle" });

  const onSubmit: SubmitHandler<any> = (data) => {
    setSaveState({ kind: "save-pending" });
    save(data)
      .then(() => {
        setSaveState({ kind: "save-idle" });
        reset();
        window["form-modal"].close();
      })
      .catch((error) =>
        setSaveState({ kind: "save-rejected", errorMessage: error.code })
      );
  };

  const cancel = () => {
    setSaveState({ kind: "save-idle" });
    reset();
    window["form-modal"].close();
  };

  return (
    <dialog id="form-modal" className="modal">
      <form
        method="dialog"
        className="modal-box flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h3 className="font-bold text-lg">Create new timetable</h3>

        {children}

        <div className="flex w-full gap-4">
          <button
            type="submit"
            className="btn-primary btn"
            disabled={saveState.kind === "save-pending"}
          >
            <AiOutlineSave size={25} />
            Save
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={cancel}
            disabled={saveState.kind === "save-pending"}
          >
            Cancel
          </button>
        </div>
        {saveState.kind === "save-rejected" && (
          <div className="alert alert-error">
            <AiOutlineExclamationCircle />
            <span>Error! {saveState.errorMessage}</span>
          </div>
        )}
      </form>
    </dialog>
  );
}
