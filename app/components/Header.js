'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Header() {
    return (
        <header className="flex justify-between items-center p-4 sm:p-6 h-16 w-full max-w-7xl mx-auto">
            <div className="flex-shrink-0">
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <SignedOut>
                    <SignInButton mode="modal" />
                    <SignUpButton mode="modal" />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
        </header>
    );
}