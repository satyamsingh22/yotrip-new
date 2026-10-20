interface EditFaqModalProps {
  formData: { question: string; answer: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: () => void;
}

const EditFaqModal = ({ formData, onChange, onSubmit }: EditFaqModalProps) => {
  return (
    <div className="modal fade" id="edit_faq_modal" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">Edit FAQ</h5>
            <button className="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div className="modal-body">
            <label className="form-label">Question</label>
            <input
              type="text"
              name="question"
              className="form-control mb-3"
              value={formData.question}
              onChange={onChange}
            />

            <label className="form-label">Answer</label>
            <textarea
              name="answer"
              className="form-control"
              rows={4}
              value={formData.answer}
              onChange={onChange}
            />
          </div>

          <div className="modal-footer">
            <button className="btn btn-light" data-bs-dismiss="modal">Close</button>
            <button className="btn btn-primary" data-bs-dismiss="modal" onClick={onSubmit}>
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditFaqModal;