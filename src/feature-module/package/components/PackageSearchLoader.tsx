import HotelSearchLoader from "../../hotel/components/HotelSearchLoader";

/** Package listing uses the same scoped loader shell as hotels. */
const PackageSearchLoader = () => <HotelSearchLoader scoped />;

export default PackageSearchLoader;
