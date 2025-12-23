import {
  Link,
  createFileRoute,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useActionState } from "react";
import AuthContainer from "@/components/auth-container";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockPasswordIcon } from "@hugeicons/core-free-icons";
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
import { signIn } from "@/services/auth/signin";

type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export const Route = createFileRoute("/signin")({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: "/", replace: true });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  async function signInAction(
    _: ActionState,
    formData: FormData,
  ): Promise<ActionState> {
    try {
      const result = await signIn({
        username: formData.get("username") as string,
        password: formData.get("password") as string,
      });

      localStorage.setItem("token", result.data.token);
      router.invalidate();
      router.navigate({ to: "/", reloadDocument: true });

      return { status: "success" };
    } catch (error) {
      return { status: "error", message: formatServiceError(error) };
    }
  }

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signInAction,
    { status: "idle" },
  );

  return (
    <AuthContainer>
      <form action={formAction}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Fill in the form below to login to your account
            </p>
          </div>
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
                minLength={8}
                required
              />
            </InputGroup>
          </Field>
          <Field>
            <Button disabled={pending} type="submit">
              {pending ? "Signing in..." : "Login"}
            </Button>
          </Field>
          {!pending && state.status === "error" && (
            <p role="alert" className="text-center text-sm text-destructive">
              {state.message}
            </p>
          )}
          <Field>
            <FieldDescription className="px-6 text-center">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthContainer>
  );
}
