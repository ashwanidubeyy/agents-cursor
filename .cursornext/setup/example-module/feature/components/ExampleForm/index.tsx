"use client";

import { useState } from "react";
import { useForm } from "@/hooks/useForm";
import type { ExampleFormValues } from "@/features/example/types/example.types";
import { ExampleFormStyles } from "./styles";

interface ExampleFormProps {
  onCreate: (values: ExampleFormValues) => Promise<unknown> | void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialState = {
  name: { value: "", error: "", required: true },
  email: {
    value: "",
    error: "",
    required: true,
    validator: {
      func: (value: string) => EMAIL_REGEX.test(value),
      error: "Enter a valid email address",
    },
  },
};

const ExampleForm = ({ onCreate }: ExampleFormProps) => {
  const [submitting, setSubmitting] = useState(false);

  const submitHandler = (params: ExampleFormValues | null, errors: any) => {
    if (errors || !params) return;
    setSubmitting(true);
    Promise.resolve(onCreate(params)).finally(() => setSubmitting(false));
  };

  const { values, errors, dirty, handleOnChange, handleOnSubmit } = useForm(
    initialState,
    submitHandler
  );

  return (
    <ExampleFormStyles.Form onSubmit={handleOnSubmit}>
      <ExampleFormStyles.Field>
        <ExampleFormStyles.Label htmlFor="name">Name</ExampleFormStyles.Label>
        <ExampleFormStyles.Input
          id="name"
          name="name"
          value={values?.name ?? ""}
          onChange={handleOnChange}
          placeholder="Jane Doe"
        />
        <ExampleFormStyles.Error>
          {dirty?.name ? errors?.name : ""}
        </ExampleFormStyles.Error>
      </ExampleFormStyles.Field>

      <ExampleFormStyles.Field>
        <ExampleFormStyles.Label htmlFor="email">Email</ExampleFormStyles.Label>
        <ExampleFormStyles.Input
          id="email"
          name="email"
          value={values?.email ?? ""}
          onChange={handleOnChange}
          placeholder="jane@example.com"
        />
        <ExampleFormStyles.Error>
          {dirty?.email ? errors?.email : ""}
        </ExampleFormStyles.Error>
      </ExampleFormStyles.Field>

      <ExampleFormStyles.Submit type="submit" disabled={submitting}>
        {submitting ? "Adding..." : "Add example"}
      </ExampleFormStyles.Submit>
    </ExampleFormStyles.Form>
  );
};

export default ExampleForm;
