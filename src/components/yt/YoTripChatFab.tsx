import { useTranslation } from "react-i18next";
import { openRelayChat } from "../../utils/relayChat";

const AVATAR = "/assets/img/yt/yori/yori-welcome.jpg";

/** Branded launcher — opens the production Relay chat widget (see relayChat.openRelayChat). */
export default function YoTripChatFab() {
  const { t } = useTranslation();

  const handleOpen = () => {
    openRelayChat();
  };

  return (
    <div className="yt-chat-fab">
      <button type="button" className="yt-chat-fab__hint" onClick={handleOpen}>
        {t("home.chatHint", { defaultValue: "Need help planning your trip?" })}
      </button>
      <button
        type="button"
        className="yt-chat-fab__btn"
        aria-label={t("home.chatOpen", { defaultValue: "Open trip assistant" })}
        onClick={handleOpen}
      >
        <img src={AVATAR} alt="" width={56} height={56} />
        <span className="yt-chat-fab__badge" aria-hidden>
          1
        </span>
      </button>
    </div>
  );
}
