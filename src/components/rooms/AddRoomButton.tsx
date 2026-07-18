"use client";

import { useState } from "react";
import { ContactAdminOverflowModalSkin } from "@/components/skins/minimal/ContactAdminOverflowModalSkin";
import { EmptyProjectOnboardingSkin } from "@/components/skins/minimal/EmptyProjectOnboardingSkin";
import { UpgradePremiumModalSkin } from "@/components/skins/minimal/UpgradePremiumModalSkin";
import { useLocale } from "@/components/LocaleProvider";
import type { AddRoomForm } from "@/hooks/useAddRoomTenant";
import { useSubscription } from "@/hooks/useSubscription";

interface AddRoomButtonProps {
  propertySlug: string;
  variant: "first" | "additional";
  disabled?: boolean;
  saving?: boolean;
  error?: string | null;
  formKey?: string;
  onSubmit: (form: AddRoomForm) => void;
}

export function AddRoomButton({
  propertySlug,
  variant,
  disabled,
  saving,
  error,
  formKey,
  onSubmit,
}: AddRoomButtonProps) {
  const { t } = useLocale();
  const subscription = useSubscription(propertySlug);
  const [showForm, setShowForm] = useState(variant === "first");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);

  const handleAddIntent = () => {
    if (subscription.addRoomGate === "allowed") {
      setShowForm(true);
      return;
    }
    if (subscription.addRoomGate === "premium_overflow") {
      setOverflowOpen(true);
      return;
    }
    setUpgradeOpen(true);
  };

  if (variant === "first") {
    if (subscription.addRoomGate !== "allowed") {
      return (
        <>
          <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center">
            <p className="text-base text-zinc-600">{t("owner.plan.limitReached")}</p>
            <button
              type="button"
              disabled={disabled}
              onClick={handleAddIntent}
              className="mt-4 flex min-h-12 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-base font-medium text-zinc-900"
            >
              + {t("owner.rooms.addRoom")}
            </button>
          </div>
          <UpgradePremiumModalSkin
            open={upgradeOpen}
            propertySlug={propertySlug}
            onClose={() => setUpgradeOpen(false)}
          />
          <ContactAdminOverflowModalSkin
            open={overflowOpen}
            onClose={() => setOverflowOpen(false)}
            onContact={subscription.openContactAdminWindow}
          />
        </>
      );
    }

    return (
      <EmptyProjectOnboardingSkin
        propertySlug={propertySlug}
        disabled={disabled}
        saving={saving}
        error={error}
        variant="first"
        onSubmit={onSubmit}
      />
    );
  }

  return (
    <>
      {!showForm && (
        <button
          type="button"
          disabled={disabled || saving}
          onClick={handleAddIntent}
          className="w-full min-h-12 rounded-lg border border-zinc-200 bg-white py-3 text-base font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + {t("owner.rooms.addRoom")}
          {subscription.roomsRemaining > 0 && (
            <span className="ml-1 font-normal text-zinc-500">
              ({t("owner.rooms.quotaHint", { remaining: subscription.roomsRemaining })})
            </span>
          )}
        </button>
      )}

      {showForm && subscription.addRoomGate === "allowed" && (
        <EmptyProjectOnboardingSkin
          propertySlug={propertySlug}
          disabled={disabled}
          saving={saving}
          error={error}
          variant="additional"
          formKey={formKey}
          onCancel={() => setShowForm(false)}
          onSubmit={onSubmit}
        />
      )}

      <UpgradePremiumModalSkin
        open={upgradeOpen}
        propertySlug={propertySlug}
        onClose={() => setUpgradeOpen(false)}
      />
      <ContactAdminOverflowModalSkin
        open={overflowOpen}
        onClose={() => setOverflowOpen(false)}
        onContact={subscription.openContactAdminWindow}
      />
    </>
  );
}
