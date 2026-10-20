import { useEffect, useMemo, useState } from "react";
import ImageWithBasePath from '../imageWithBasePath';
import { getSymbolFromCurrency } from "country-data-list";
import { formatAmount } from "@/utils/formatMoney";
import HotelListingPrice from "@/feature-module/hotel/components/HotelListingPrice";

type RoomDetailModalProps = {
    room: any;
    id?: string;
    onSelect?: (room: any) => void;
};

const DEFAULT_ROOM_IMAGE = "/assets/img/hotels/hotel-thumb-06.jpg";

const RoomDetailModal = ({ room, id = "room-details", onSelect }: RoomDetailModalProps) => {
    const gallery = useMemo(() => {
        const urls = [
            ...(Array.isArray(room?.images) ? room.images : []),
            room?.image,
        ]
            .map((url) => (typeof url === "string" ? url.trim() : ""))
            .filter(Boolean);
        const unique = [...new Set(urls)];
        return unique.length ? unique : [DEFAULT_ROOM_IMAGE];
    }, [room?.image, room?.images]);

    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        setActiveIndex(0);
    }, [room?.name, room?.rateKey, room?.optionId, gallery.join("|")]);

    const goPrev = () => {
        setActiveIndex((i) => (i - 1 + gallery.length) % gallery.length);
    };

    const goNext = () => {
        setActiveIndex((i) => (i + 1) % gallery.length);
    };

    const cleanAmenity = (amenity: string) => {
        const lower = amenity.toLowerCase();
        if (lower.includes("parking")) return "Parking";
        if (lower.includes("internet") || lower.includes("wifi")) return "Free WiFi";
        if (lower.includes("pool")) return "Pool";
        if (lower.includes("laundry")) return "Laundry";
        return amenity;
    };

    const amenityList: string[] = Array.isArray(room.amenities) ? room.amenities : [];
    const hotelAmenities = [...new Set(amenityList.map((a) => cleanAmenity(a)))];

    const midpoint = Math.ceil(hotelAmenities.length / 2);
    const firstHalf = hotelAmenities.slice(0, midpoint);
    const secondHalf = hotelAmenities.slice(midpoint);

    // Room size can arrive under a few different keys depending on the supplier;
    // only show it when the API actually provides one (never fabricated).
    const rawSize = room.size ?? room.roomSize ?? room.area ?? room.squareMeters;
    const roomSize =
        rawSize == null || rawSize === ""
            ? ""
            : /\d\s*(m²|sqm|sq\.?\s*m|ft²|sqft)/i.test(String(rawSize))
                ? String(rawSize)
                : `${rawSize} m²`;

    // What's included — derived conservatively from booleans + the rate name.
    const planName = String(room.ratePlanName || "").toLowerCase();
    const included: { icon: string; label: string }[] = [
        {
            icon: room.refundable ? "isax-shield-tick" : "isax-close-circle",
            label: room.refundable ? "Free cancellation" : "Non-refundable",
        },
    ];
    if (room.breakfast || /breakfast|bkfst/.test(planName)) {
        included.push({ icon: "isax-coffee", label: "Breakfast included" });
    }
    if (/wifi|internet/.test(planName)) {
        included.push({ icon: "isax-wifi", label: "Free WiFi" });
    }
    if (/(all meal|full board|major meal|half board|dinner)/.test(planName)) {
        included.push({ icon: "isax-reserve", label: "Meals included" });
    }

    const facts = [
        room.bedType && {
            icon: "isax-bed",
            label: "Bed",
            value: `${room.beds ? `${room.beds} ` : ""}${room.bedType} Bed`,
        },
        roomSize && { icon: "isax-maximize-3", label: "Room size", value: roomSize },
        room.sleeps && {
            icon: "isax-profile-2user",
            label: "Sleeps",
            value: `${room.sleeps} ${Number(room.sleeps) === 1 ? "guest" : "guests"}`,
        },
        room.view && { icon: "isax-eye", label: "View", value: room.view },
    ].filter(Boolean) as { icon: string; label: string; value: string }[];

    return (
        <div className="modal fade" id={id}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                <div className="modal-content border-0 rounded-4 overflow-hidden">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="mb-0">Room details</h5>
                        <button
                            type="button"
                            className="border-0 bg-transparent"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        >
                            <i className="ti ti-x fs-16" />
                        </button>
                    </div>

                    <div className="modal-body pt-2">
                        <div className="position-relative mb-2">
                            <ImageWithBasePath
                                src={gallery[activeIndex] || DEFAULT_ROOM_IMAGE}
                                className="rounded-4 img-fluid w-100"
                                style={{ maxHeight: 280, objectFit: "cover" }}
                                alt={`${room.name || "Room"} photo ${activeIndex + 1}`}
                            />
                            <span className={`badge ${room.refundable ? "badge-success" : "badge-soft-danger"} position-absolute top-0 start-0 m-3`}>
                                {room.refundable ? "Refundable" : "Non Refundable"}
                            </span>
                            {gallery.length > 1 && (
                                <>
                                    <span className="badge bg-dark bg-opacity-75 position-absolute top-0 end-0 m-3">
                                        {activeIndex + 1} / {gallery.length}
                                    </span>
                                    <button
                                        type="button"
                                        className="btn btn-light btn-sm rounded-circle position-absolute top-50 start-0 translate-middle-y ms-2"
                                        aria-label="Previous photo"
                                        onClick={goPrev}
                                    >
                                        <i className="isax isax-arrow-left-2" />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-light btn-sm rounded-circle position-absolute top-50 end-0 translate-middle-y me-2"
                                        aria-label="Next photo"
                                        onClick={goNext}
                                    >
                                        <i className="isax isax-arrow-right-3" />
                                    </button>
                                </>
                            )}
                        </div>

                        {gallery.length > 1 && (
                            <div className="d-flex gap-2 overflow-auto pb-2 mb-3">
                                {gallery.map((src, index) => (
                                    <button
                                        key={`${src}-${index}`}
                                        type="button"
                                        className="border-0 p-0 bg-transparent flex-shrink-0"
                                        onClick={() => setActiveIndex(index)}
                                        aria-label={`Show photo ${index + 1}`}
                                    >
                                        <img
                                            src={src}
                                            alt=""
                                            className="rounded-2"
                                            style={{
                                                width: 64,
                                                height: 48,
                                                objectFit: "cover",
                                                outline:
                                                    index === activeIndex
                                                        ? "2px solid #0d6efd"
                                                        : "2px solid transparent",
                                                outlineOffset: 1,
                                                opacity: index === activeIndex ? 1 : 0.75,
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="d-flex align-items-start justify-content-between flex-wrap row-gap-2 mb-3">
                            <div className="pe-3">
                                <h4 className="mb-1">{room.name}</h4>
                                {room.ratePlanName && (
                                    <p className="fs-14 text-muted mb-0 text-capitalize">
                                        {String(room.ratePlanName).toLowerCase()}
                                    </p>
                                )}
                            </div>
                            <div className="text-end">
                                <HotelListingPrice
                                    nightly={room.price}
                                    totalPrice={room.totalPrice}
                                    currency={room.currency}
                                    className="justify-content-end"
                                />
                            </div>
                        </div>

                        {/* Quick facts — bed, room size, occupancy and view at a glance */}
                        {facts.length > 0 && (
                            <div className="bg-light rounded-3 p-3 mb-3">
                                <div className="row g-3">
                                    {facts.map((fact) => (
                                        <div className="col-6 col-md-3" key={fact.label}>
                                            <div className="d-flex align-items-start">
                                                <i className={`isax ${fact.icon} text-primary me-2 mt-1`} />
                                                <div>
                                                    <span className="d-block fs-12 text-muted">{fact.label}</span>
                                                    <span className="fw-medium">{fact.value}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* What's included */}
                        <div className="mb-3">
                            <h6 className="mb-2">What's included</h6>
                            <div className="d-flex flex-wrap gap-3">
                                {included.map((item) => (
                                    <span
                                        key={item.label}
                                        className={`fs-14 d-flex align-items-center ${item.icon === "isax-close-circle" ? "text-muted" : "text-success"}`}
                                    >
                                        <i className={`isax ${item.icon} me-2`} />
                                        {item.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {room.description && (
                            <div className="mb-3">
                                <h6 className="mb-2">About this room</h6>
                                <p className="mb-0 text-gray-7">{room.description}</p>
                            </div>
                        )}

                        {hotelAmenities.length > 0 && (
                            <div className="mb-2">
                                <h6 className="mb-2">Amenities</h6>
                                <div className="row">
                                    <div className="col-md-6">
                                        {firstHalf.map((item, index) => (
                                            <div key={index} className="d-flex align-items-start mb-2">
                                                <i className="isax isax-tick-circle5 text-success me-2 mt-1" />
                                                <span className="text-gray-7">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="col-md-6">
                                        {secondHalf.map((item, index) => (
                                            <div key={index} className="d-flex align-items-start mb-2">
                                                <i className="isax isax-tick-circle5 text-success me-2 mt-1" />
                                                <span className="text-gray-7">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {room.extras?.length > 0 && (
                            <div className="mt-3">
                                <h6 className="mb-2">Additional options</h6>
                                {room.extras.map((extra: any, index: number) => (
                                    <div key={index} className="d-flex justify-content-between align-items-center mb-1">
                                        <span>
                                            <i className="isax isax-add-circle text-primary me-2" />
                                            {extra.name}
                                        </span>
                                        <span className="text-muted">
                                            {Number(extra.price) === 0 ? "Free" : `${extra.currency} ${extra.price}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {onSelect && (
                        <div className="modal-footer border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <div>
                                <span className="fs-18 fw-semibold text-primary">
                                    {getSymbolFromCurrency(room.currency)} {formatAmount(room.price, room.currency)}
                                </span>
                                <span className="fs-13 text-muted"> / night</span>
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary rounded-pill px-4"
                                data-bs-dismiss="modal"
                                onClick={() => onSelect(room)}
                            >
                                Select this room
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomDetailModal;
