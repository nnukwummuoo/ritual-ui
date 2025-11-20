"use client";

import ConditionalLayout from "@/components/ConditionalLayout";
import useClientAuth from "@/hooks/useClientAuth";
import { NotificationModalWrapper } from "@/components/NotificationModalWrapper";
import { ReactNode } from "react";

export default function ConditionalLayoutWrapper({ children, ssrAuth }: { children: ReactNode, ssrAuth: boolean }) {
    const { isAuth } = useClientAuth(ssrAuth);

    return (
        <ConditionalLayout isAuthenticated={isAuth}>
            {children}
            {isAuth && <NotificationModalWrapper />}
        </ConditionalLayout>
    );
}
