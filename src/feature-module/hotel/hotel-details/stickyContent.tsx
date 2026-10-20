import { useTranslation } from "react-i18next";
import BannerCounter from '../../../core/common/banner-counter/counter'
import { DatePicker } from 'antd'
import { useHotelSearch } from '@/context/HotelSearchContext'
import { scrollToSection } from '@/utils/scrollTo'
import HotelListingPrice from '../components/HotelListingPrice'
import HotelDistanceFromCenter from '../components/HotelDistanceFromCenter'
import {
    applyHotelCheckInChange,
    applyHotelCheckOutChange,
    disableBeforeToday,
    disableHotelCheckOutDate,
} from '@/utils/dateValidation'

const StickyContent = ({ hotel }: { hotel: any }) => {
    const { t } = useTranslation();
    const { checkIn, checkOut, guests, userCurrency, displayCurrency, setCheckIn, setCheckOut, setGuests } = useHotelSearch();

    const address_ = `${hotel.name}, ${hotel.address.line1},  ${hotel.address.city.value}`;
    const priceCurrency = displayCurrency || hotel?.currency || userCurrency;

    const startsFromRate =
        hotel?.rates?.reduce((min: any, rate: any) => {
            if (!min) return rate;
            return parseFloat(rate?.avgNight) < parseFloat(min?.avgNight) ? rate : min;
        }, null);

    return (
        <div className='sticky-components'>
            {/* Availability */}
            <div className="card shadow-none">
                <div className="card-body">
                    <div className="mb-3">
                        <p className="fs-13 fw-medium mb-1">{t("hotelList.startsFrom")}</p>
                        <HotelListingPrice
                            nightly={startsFromRate?.avgNight}
                            totalPrice={startsFromRate?.totalPrice}
                            currency={priceCurrency}
                        />
                    </div>
                    <div className="banner-form">
                        <form >
                            <div className="form-info border-0">
                                <div className="form-item border rounded p-3 mb-3 w-100">
                                    <label className="form-label fs-14 text-default mb-0">Check In</label>
                                    <DatePicker
                                        className="form-control datetimepicker"
                                        placeholder="dd/mm/yyyy"
                                        value={checkIn}
                                        onChange={(value) => {
                                            const next = applyHotelCheckInChange(value, checkOut);
                                            setCheckIn(next.checkIn);
                                            setCheckOut(next.checkOut);
                                        }}
                                        format="DD-MM-YYYY"
                                        allowClear={false}
                                        disabledDate={disableBeforeToday}
                                    />
                                    <p className="fs-12">{checkIn ? checkIn?.format("dddd") : ""}</p>
                                </div>
                                <div className="form-item border rounded p-3 mb-3 w-100">
                                    <label className="form-label fs-14 text-default mb-0">Check Out</label>
                                    <DatePicker
                                        className="form-control datetimepicker"
                                        placeholder="dd/mm/yyyy"
                                        value={checkOut}
                                        onChange={(value) => setCheckOut(applyHotelCheckOutChange(value, checkIn))}
                                        format="DD-MM-YYYY"
                                        allowClear={false}
                                        disabledDate={disableHotelCheckOutDate(checkIn)}
                                    />
                                    <p className="fs-12">{checkOut ? checkOut?.format("dddd") : ""}</p>
                                </div>

                                <div className="card shadow-none mb-3">
                                    <div className="card-body p-3 pb-0">
                                        <div className="border-bottom pb-2 mb-2">
                                            <h6>Details</h6>
                                        </div>
                                        <div className="custom-increment">
                                            <div className="mb-3 d-flex align-items-center justify-content-between">
                                                <label className="form-label text-gray-9 mb-0">Adults</label>
                                                <BannerCounter min={1} value={guests.adults} onChange={(value) => setGuests((prev) => ({ ...prev, adults: value }))} />
                                            </div>
                                            <div className="mb-3 d-flex align-items-center justify-content-between">
                                                <label className="form-label text-gray-9 mb-0">Children <span className="text-default fw-normal">( 2-12 Yrs )</span></label>
                                                <BannerCounter
                                                    min={0}
                                                    value={guests.children}
                                                    onChange={(value) => {
                                                        setGuests((prev) => {
                                                            let newAges = [...(prev.childAges || [])];

                                                            if (value > prev.children) {
                                                                while (newAges.length < value) {
                                                                    newAges.push(5); // default age
                                                                }
                                                            } else {
                                                                newAges = newAges.slice(0, value);
                                                            }

                                                            return {
                                                                ...prev,
                                                                children: value,
                                                                childAges: newAges
                                                            };
                                                        });
                                                    }}
                                                />
                                            </div>
                                             {guests.children > 0 && (
                                                        <div className="mb-3">
                                                            <label className="form-label text-gray-9 mb-2">
                                                                Children Ages
                                                            </label>

                                                            <div className="d-flex flex-wrap gap-2">
                                                                {guests.childAges?.map((age, index) => (
                                                                    <select
                                                                        key={index}
                                                                        className="form-select"
                                                                        style={{ width: "120px" }}
                                                                        value={age}
                                                                        onChange={(e) => {
                                                                            const newAges = [...guests.childAges];
                                                                            newAges[index] = Number(e.target.value);

                                                                            setGuests((prev) => ({
                                                                                ...prev,
                                                                                childAges: newAges
                                                                            }));
                                                                        }}
                                                                    >
                                                                        {Array.from({ length: 12 }, (_, i) => (
                                                                            <option key={i} value={i + 1}>
                                                                                {i + 1} yrs
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                            <div className="mb-3 d-flex align-items-center justify-content-between">
                                                <label className="form-label text-gray-9">Infants <span className="text-default fw-normal mb-0">( 0-12 Yrs )</span></label>
                                                <BannerCounter min={0} value={guests.infants} onChange={(value) => setGuests((prev) => ({ ...prev, infants: value }))} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="button" onClick={()=>scrollToSection("availability")} className="rounded-pill btn btn-primary btn-lg search-btn ms-0 mb-3 w-100 fs-14 d-flex justify-content-center">{t("hotelList.bookNow")}</button>
                        </form>
                    </div>
                    <div className="d-flex align-items-center justify-content-end mt-1">
                        <button onClick={()=>scrollToSection("availability")} className="btn btn-link link-primary fs-14 p-0"
>{t("hotelList.viewRooms")}</button>
                    </div>
                </div>
            </div>
            {/* /Availability */}

            {/* Map — address from Sabre / Tripjack hotel data */}
            {(hotel?.name || hotel?.address) && (
            <div className="card shadow-none" id="location">
                <div>
                    <iframe src={`https://www.google.com/maps?q=${encodeURIComponent(address_)}&z=15&output=embed`}
                        allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="contact-map"></iframe>
                </div>
                <div className="card-body">
                    <p className="d-flex align-items-center mb-2">
                        <i className="isax isax-location5 me-2"></i>
                        <span>{address_}</span>
                    </p>
                    <HotelDistanceFromCenter
                        hotel={hotel}
                        className="fs-14 text-muted mb-0"
                    />
                </div>
            </div>
            )}
            {/* /Map */}

            {/* Contact — only fields returned by Sabre / Tripjack */}
            {(hotel?.contact?.phone || hotel?.contact?.fax) && (
            <div className="card shadow-none mb-0">
                <div className="card-body">
                    <h5 className="mb-3 fs-18">{t("hotelList.hotelContact", { defaultValue: "Hotel Contact" })}</h5>
                    <div className="border br-10 p-3">
                        {hotel?.contact?.phone ? (
                            <div className={`d-flex align-items-center ${hotel?.contact?.fax ? "border-bottom pb-3 mb-3" : ""}`}>
                                <span className="avatar avatar-sm me-2 rounded-circle flex-shrink-0 bg-primary">
                                    <i className="isax isax-call-outgoing5"></i>
                                </span>
                                <p className="mb-0">
                                    {t("hotelList.callUs", { defaultValue: "Call Us" })} : {hotel.contact.phone}
                                </p>
                            </div>
                        ) : null}
                        {hotel?.contact?.fax ? (
                            <div className="d-flex align-items-center">
                                <span className="avatar avatar-sm me-2 rounded-circle flex-shrink-0 bg-primary">
                                    <i className="isax isax-message-search5"></i>
                                </span>
                                <p className="mb-0">
                                    {t("hotelList.fax", { defaultValue: "Fax" })} : {hotel.contact.fax}
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
            )}
        </div>
    )
}


export default StickyContent