
import { Link } from 'react-router-dom';
import type { TableData } from '../../../core/common/data/interface';
import Table from "../../../core/common/dataTable/index";
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import PredefinedDateRanges from '../../../core/common/range-picker/datePicker';
import { all_routes } from '../../router/all_routes';
import Sidebar from '../../../core/common/sidebar/sidebar';

const Payment = () => {

    const routes = all_routes;

    // No per-user payment history endpoint exists yet. This used to render the
    // template's PaymentData fixture, which showed every user the same invented
    // transactions.
    const data: TableData[] = [];
    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (_text: any, render: any) => (
                <Link to={routes.invoices} className="link-primary fw-medium">
                    {render.id}
                </Link>

            ),
            sorter: (a: TableData, b: TableData) => a.id.length - b.id.length,
        },
        {
            title: "Payment",
            dataIndex: "payment",
            key: "payment",
            render: (_text: any, render: any) => (
                <h6 className='fs-14'>{render.payment}</h6>
            ),
            sorter: (a: TableData, b: TableData) =>
                a.payment.length - b.payment.length,
        },
        {
            title: "Service",
            dataIndex: "service",
            key: "service",
            sorter: (a: TableData, b: TableData) => a.service.length - b.service.length,
        },
        {
            title: "Payment Type",
            dataIndex: "paymentType",
            key: "paymentType",
            sorter: (a: TableData, b: TableData) => a.paymentType.length - b.paymentType.length,
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            sorter: (a: TableData, b: TableData) => a.date.length - b.date.length,
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            sorter: (a: TableData, b: TableData) => a.amount.length - b.amount.length,
        },
        {
            title: "Status",
            dataIndex: "status",
            sorter: (a: TableData, b: TableData) => a.status.length - b.status.length,
            render: (status: any) => (
                <>
                    <span
                        className={`badge  rounded-pill d-inline-flex align-items-center fs-10 ${status === "Completed" ? "badge-success" : status === "Pending" ? "badge-secondary" : "badge-danger"}`}
                    >
                        <i className="ti ti-circle-filled fs-5 me-1" />
                        {status}
                    </span>
                </>
            ),
        },
    ];

    //Breadcrumb Data
    const breadcrumbs = [
        {
            label: 'Payments',
            link: routes.home1,
            active: false,
        },
        {
            label: 'Payments',
            active: true,
        },
    ];

    return (
        <div>
            <>
                <div>
                    <Breadcrumb
                        title="Payments"
                        breadcrumbs={breadcrumbs}
                        backgroundClass="breadcrumb-bg-01"
                    />
                </div>
                {/* Page Wrapper */}
                <div className="content">
                    <div className="container">
                        <div className="row">
                            {/* Sidebar */}
                            <div className="col-xl-3 col-lg-4">
                                <Sidebar />
                            </div>
                            {/* /Sidebar */}
                            {/* Payments */}
                            <div className="col-xl-9 col-lg-8">
                                <div className="card hotel-list">
                                    <div className="card-body p-0">
                                        <div className="list-header d-flex align-items-center justify-content-between flex-wrap">
                                            <h6>Payments</h6>
                                        </div>
                                        {data.length === 0 ? (
                                            <p className="p-4 text-center text-gray-6 mb-0">
                                                No payments yet.
                                            </p>
                                        ) : (
                                            <Table dataSource={data} columns={columns} Selection={false} />
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* /Payments */}
                        </div>
                    </div>
                </div>
                {/* /Page Wrapper */}
            </>

        </div>
    )
}

export default Payment
