import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-50 via-amber-50/30 to-white px-4">
      <div className="w-full max-w-md mx-auto">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full flex justify-center',
              card: 'w-full shadow-xl rounded-2xl',
            },
          }}
        />
      </div>
    </div>
  );
}
