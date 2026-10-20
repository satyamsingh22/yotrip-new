interface DeleteFaqModalProps {
  onConfirm: () => void;
}

const DeleteFaqModal = ({ onConfirm }: DeleteFaqModalProps) => {
  return (
    <div className="modal fade" id="delete_faq_modal" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content">

          <div className="modal-body text-center">

            <h5 className="mb-3">Confirm Delete</h5>
            <p className="mb-3">Are you sure you want to delete this FAQ?</p>

            <div className="d-flex justify-content-center">

              <button className="btn btn-light me-2" data-bs-dismiss="modal">
                No
              </button>

              <button className="btn btn-primary" data-bs-dismiss="modal" onClick={onConfirm}>
                Yes
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteFaqModal;