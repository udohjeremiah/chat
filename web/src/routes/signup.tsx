import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useActionState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  LockPasswordIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import AuthContainer from "@/components/auth-container";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { formatServiceError } from "@/utils/format-service-error";
import { signUp } from "@/services/auth/signup";
import { Alert, AlertTitle } from "@/components/ui/alert";

type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export const Route = createFileRoute("/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const signUpAction = async (
    _: ActionState,
    formData: FormData,
  ): Promise<ActionState> => {
    try {
      await signUp({
        name: formData.get("name") as string,
        username: formData.get("username") as string,
        password: formData.get("password") as string,
      });

      navigate({ to: "/signin" });

      return { status: "success" };
    } catch (error) {
      return { status: "error", message: formatServiceError(error) };
    }
  };

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signUpAction,
    { status: "idle" },
  );

  return (
    <AuthContainer>
      <form action={formAction}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Fill in the form below to create your account
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <HugeiconsIcon icon={UserIcon} />
              </InputGroupAddon>
              <InputGroupInput
                disabled={pending}
                id="name"
                name="name"
                type="text"
                placeholder="Udoh Jeremiah"
                minLength={3}
                required
              />
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>@</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                disabled={pending}
                id="username"
                name="username"
                type="text"
                placeholder="udohjeremiah"
                minLength={3}
                required
              />
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <HugeiconsIcon icon={LockPasswordIcon} />
              </InputGroupAddon>
              <InputGroupInput
                disabled={pending}
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </InputGroup>
          </Field>
          <Field>
            <Button disabled={pending} type="submit">
              {pending ? "Signing up..." : "Sign up"}
            </Button>
          </Field>
          {!pending && state.status === "error" && (
            <Alert variant="destructive">
              <HugeiconsIcon icon={AlertCircleIcon} />
              <AlertTitle>{state.message}</AlertTitle>
            </Alert>
          )}
          <Field>
            <FieldDescription className="text-center">
              Already have an account? <Link to="/signin">Sign in</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthContainer>
  );
}
