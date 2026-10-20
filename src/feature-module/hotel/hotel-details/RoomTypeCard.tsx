import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getSymbolFromCurrency } from "country-data-list";
import { formatAmount } from "@/utils/formatMoney";
import RoomDetailModal from "../../../core/common/modal/roomDetailModal";
import HotelListingPrice from "../components/HotelListingPrice";

// Turns a price (which the API sends as a string) into a number we can sort by.
const toNumber = (value: any): number => {
    const n = parseFloat(String(value ?? "").replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
};

// A human label for a bed/view variant, e.g. "1 King Bed · City View".
const variantLabel = (room: any): string => {
    const bed = room.bedType
        ? `${room.beds ? `${room.beds} ` : ""}${room.bedType} Bed`
        : "";
    return [bed, room.view].filter(Boolean).join(" · ") || "Standard";
};

const variantKey = (room: any): string =>
    `${room.beds ?? ""}|${room.bedType ?? ""}|${room.view ?? ""}`;

// What a rate plan includes, derived from the booleans + the plan name. Kept
// conservative so we never claim an inclusion the rate doesn't actually offer.
const getInclusions = (room: any): { icon: string; label: string }[] => {
    const name = String(room.ratePlanName || "").toLowerCase();
    const out: { icon: string; label: string }[] = [];
    const hasBreakfast = room.breakfast || /breakfast|bkfst/.test(name);
    if (hasBreakfast) out.push({ icon: "isax-coffee", label: "Breakfast included" });
    if (/wifi|internet/.test(name)) out.push({ icon: "isax-wifi", label: "Free WiFi" });
    if (/(all meal|full board|major meal|half board|dinner)/.test(name)) {
        out.push({ icon: "isax-reserve", label: "Meals included" });
    }
    return out;
};

type RateRowProps = {
    room: any;
    isLowest?: boolean;
    onSelect: (room: any) => void;
};

// A single rate plan: name + what's included on the left, price + actions right.
const RateRow = ({ room, isLowest = false, onSelect }: RateRowProps) => {
    const { t } = useTranslation();
    const inclusions = getInclusions(room);
    return (
        <div className="d-flex flex-column flex-md-row flex-md-nowrap align-items-start gap-3 py-3">
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                    {room.ratePlanName && (
                        <span className="fw-semibold text-dark text-capitalize">
                            {String(room.ratePlanName).toLowerCase()}
                        </span>
                    )}
                    {isLowest && (
                        <span className="badge badge-soft-primary d-inline-flex align-items-center">
                            <i className="isax isax-tag me-1" />
                            Lowest price
                        </span>
                    )}
                </div>
                <div className="d-flex align-items-center flex-wrap gap-3">
                    <span
                        className={`fs-13 d-flex align-items-center ${room.refundable ? "text-success" : "text-muted"}`}
                    >
                        <i className={`isax ${room.refundable ? "isax-shield-tick" : "isax-close-circle"} me-1`} />
                        {room.refundable ? "Free cancellation" : "Non-refundable"}
                    </span>
                    {inclusions.map((inc) => (
                        <span key={inc.label} className="fs-13 text-gray-7 d-flex align-items-center">
                            <i className={`isax ${inc.icon} me-1 text-primary`} />
                            {inc.label}
                        </span>
                    ))}
                    {room.sleeps && (
                        <span className="fs-13 text-gray-7 d-flex align-items-center">
                            <i className="isax isax-profile-2user me-1 text-primary" />
                            Sleeps {room.sleeps}
                        </span>
                    )}
                </div>
            </div>

            <div className="text-start text-md-end flex-md-shrink-0">
                <HotelListingPrice
                    nightly={room.price}
                    totalPrice={room.totalPrice}
                    currency={room.currency}
                    className="justify-content-md-end mb-2"
                />
                <div className="d-flex align-items-center justify-content-start justify-content-md-end gap-3 flex-nowrap mt-1">
                    <Link
                        to="#"
                        data-bs-toggle="modal"
                        data-bs-target={`#room-details-${room._index}`}
                        className="fs-14 link-primary text-nowrap"
                    >
                        {t("hotelList.viewDetails")}
                    </Link>
                    <button
                        className="btn btn-primary btn-sm rounded-pill text-nowrap"
                        onClick={() => onSelect(room)}
                    >
                        {t("hotelList.selectRoom")}
                    </button>
                </div>
            </div>
            <RoomDetailModal room={room} id={`room-details-${room._index}`} onSelect={onSelect} />
        </div>
    );
};

type RateListProps = {
    rates: any[];
    onSelect: (room: any) => void;
    initialVisible: number;
    markLowest?: boolean;
};

// A price-sorted list of rates that shows the cheapest few and tucks the rest
// behind a toggle, so a long rate sheet never overwhelms the page.
const RateList = ({ rates, onSelect, initialVisible, markLowest = false }: RateListProps) => {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? rates : rates.slice(0, initialVisible);
    const hiddenCount = rates.length - initialVisible;

    return (
        <>
            {visible.map((rate, i) => (
                <div className={i > 0 ? "border-top" : ""} key={rate._index}>
                    <RateRow room={rate} isLowest={markLowest && i === 0} onSelect={onSelect} />
                </div>
            ))}
            {hiddenCount > 0 && (
                <button
                    type="button"
                    className="btn btn-link text-decoration-none p-0 pb-1 fs-14 d-inline-flex align-items-center"
                    onClick={() => setExpanded((v) => !v)}
                >
                    {expanded ? (
                        <>
                            Show fewer rates
                            <i className="isax isax-arrow-up-2 ms-1" />
                        </>
                    ) : (
                        <>
                            {`Show all ${rates.length} rates`}
                            <i className="isax isax-arrow-down-1 ms-1" />
                        </>
                    )}
                </button>
            )}
        </>
    );
};

type VariantBlockProps = {
    label: string;
    rates: any[];
    onSelect: (room: any) => void;
};

// One bed/view variant: a labelled section with its own collapsible rate list.
const VariantBlock = ({ label, rates, onSelect }: VariantBlockProps) => {
    const sample = rates[0] || {};
    return (
        <div className="border-top px-3">
            <div className="d-flex align-items-center flex-wrap gap-2 pt-3">
                <i className="isax isax-bed text-primary" />
                <span className="fw-semibold text-dark">{label}</span>
                {sample.sleeps && (
                    <span className="badge badge-soft-secondary">Sleeps {sample.sleeps}</span>
                )}
            </div>
            <RateList rates={rates} onSelect={onSelect} initialVisible={1} />
        </div>
    );
};

type RoomTypeCardProps = {
    typeName: string;
    group: any[];
    onSelect: (room: any) => void;
};

// A room type (e.g. "Deluxe Room") with its rate plans. When the rates differ by
// bed/view they're split into labelled variant sections; otherwise they fall
// back to a single collapsible list keyed on the meal plan / rate name.
const RoomTypeCard = ({ typeName, group, onSelect }: RoomTypeCardProps) => {
    const variants = useMemo(() => {
        const byVariant = new Map<string, any[]>();
        for (const room of group) {
            const key = variantKey(room);
            if (!byVariant.has(key)) byVariant.set(key, []);
            byVariant.get(key)!.push(room);
        }
        // Cheapest rate first within each variant, cheapest variant first overall.
        return Array.from(byVariant.values())
            .map((rates) => rates.slice().sort((a, b) => toNumber(a.price) - toNumber(b.price)))
            .sort((a, b) => toNumber(a[0]?.price) - toNumber(b[0]?.price));
    }, [group]);

    const sortedFlat = useMemo(
        () => group.slice().sort((a, b) => toNumber(a.price) - toNumber(b.price)),
        [group]
    );

    const hasMeaningfulVariants = variants.length > 1;
    const cheapest = sortedFlat[0];

    return (
        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            {/* Room type header — one thumbnail per type, not stretched per row */}
            <div className="d-flex align-items-center gap-3 p-3 bg-light border-bottom">
                <img
                    src={
                        group[0]?.image ||
                        group[0]?.images?.[0] ||
                        "/assets/img/hotels/hotel-thumb-06.jpg"
                    }
                    alt={typeName}
                    className="rounded-3 flex-shrink-0"
                    style={{ width: 80, height: 80, objectFit: "cover" }}
                />
                <div className="overflow-hidden">
                    <h5 className="mb-1 text-truncate">{typeName}</h5>
                    <p className="fs-13 text-muted mb-0">
                        {group.length} {group.length > 1 ? "rate options" : "rate option"}
                        {cheapest?.price != null && (
                            <>
                                {" · from "}
                                <span className="text-gray-9 fw-semibold">
                                    {getSymbolFromCurrency(cheapest.currency)} {formatAmount(cheapest.price, cheapest.currency)}
                                </span>
                                /night
                            </>
                        )}
                    </p>
                </div>
            </div>

            {hasMeaningfulVariants ? (
                variants.map((rates, i) => (
                    <VariantBlock
                        key={i}
                        label={variantLabel(rates[0])}
                        rates={rates}
                        onSelect={onSelect}
                    />
                ))
            ) : (
                <div className="px-3">
                    <RateList rates={sortedFlat} onSelect={onSelect} initialVisible={3} markLowest />
                </div>
            )}
        </div>
    );
};

export default RoomTypeCard;
