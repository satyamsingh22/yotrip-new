import { useEffect, useState } from "react";
import api from "@/tockenapi/api";
import toast from "react-hot-toast";
import CustomSelect from "../../../core/common/commonSelect";
import { countryOptions } from "@/utils/countries";
import { type SavedTraveler } from "@/utils/flightBookingPayload";

const emptyForm = {
  label: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "M",
  passengerType: "adult" as "adult" | "child" | "infant",
  passport: {
    documentNumber: "",
    issuingCountry: "",
    expiryDate: "",
    nationality: "",
  },
};

const maskPassport = (documentNumber?: string) => {
  if (!documentNumber) return "N/A";
  if (documentNumber.length <= 4) return documentNumber;
  return `•••• ${documentNumber.slice(-4)}`;
};

const SavedTravelers = () => {
  const [travelers, setTravelers] = useState<SavedTraveler[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadTravelers = async () => {
    try {
      const res = await api.get("/api/auth/saved-travelers");
      setTravelers(res.data || []);
    } catch {
      toast.error("Could not load saved travelers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTravelers();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (traveler: SavedTraveler) => {
    setEditingId(traveler._id);
    setForm({
      label: traveler.label || "",
      firstName: traveler.firstName,
      lastName: traveler.lastName,
      dateOfBirth: traveler.dateOfBirth || "",
      gender: traveler.gender || "M",
      passengerType: traveler.passengerType || "adult",
      passport: {
        documentNumber: traveler.passport?.documentNumber || "",
        issuingCountry: traveler.passport?.issuingCountry || "",
        expiryDate: traveler.passport?.expiryDate || "",
        nationality: traveler.passport?.nationality || "",
      },
    });
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/api/auth/saved-travelers/${editingId}`, form);
        toast.success("Traveler updated");
      } else {
        await api.post("/api/auth/saved-travelers", form);
        toast.success("Traveler added");
      }
      setShowForm(false);
      loadTravelers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Could not save traveler");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this saved traveler?")) return;

    try {
      await api.delete(`/api/auth/saved-travelers/${id}`);
      setTravelers((prev) => prev.filter((t) => t._id !== id));
      toast.success("Traveler removed");
    } catch {
      toast.error("Could not remove traveler");
    }
  };

  return (
    <section className="ypf-card" aria-label="Saved Travelers">
      <header className="ypf-card__head">
        <span className="ypf-card__icon" aria-hidden>
          <i className="isax isax-profile-2user" />
        </span>
        <div className="ypf-card__title">
          <h2>Saved Travelers</h2>
          <p>Save passenger details for family &amp; friends to auto-fill them during booking.</p>
        </div>
        <button className="ypf-btn ypf-btn--primary" onClick={openAddForm} type="button">
          <i className="isax isax-add" aria-hidden />
          Add Traveler
        </button>
      </header>

      <div className="ypf-travelers">
        {loading ? (
          <p className="ypf-muted">Loading...</p>
        ) : travelers.length === 0 ? (
          <div className="ypf-empty">
            <img
              src="/assets/img/yt/profile/profile-travelers.webp"
              alt=""
              width={608}
              height={284}
              loading="lazy"
            />
            <div>
              <h3>No saved travelers yet</h3>
              <p>Add your traveler details to make your future bookings faster and easier.</p>
              <button className="ypf-btn ypf-btn--outline" onClick={openAddForm} type="button">
                <i className="isax isax-add" aria-hidden />
                Add Traveler
              </button>
            </div>
          </div>
        ) : (
          <ul className="ypf-traveler-list">
            {travelers.map((traveler) => (
              <li className="ypf-traveler" key={traveler._id}>
                <span className="ypf-traveler__avatar" aria-hidden>
                  {`${traveler.firstName?.[0] || ""}${traveler.lastName?.[0] || ""}`.toUpperCase()}
                </span>
                <div className="ypf-traveler__body">
                  <h3>
                    {traveler.firstName} {traveler.lastName}
                    {traveler.label && <span className="ypf-tag">{traveler.label}</span>}
                  </h3>
                  <p>Passport: {maskPassport(traveler.passport?.documentNumber)}</p>
                  {traveler.passport?.expiryDate && <p>Expires: {traveler.passport.expiryDate}</p>}
                </div>
                <div className="ypf-traveler__actions">
                  <button
                    type="button"
                    aria-label={`Edit ${traveler.firstName}`}
                    onClick={() => openEditForm(traveler)}
                  >
                    <i className="isax isax-edit-2" />
                  </button>
                  <button
                    type="button"
                    className="is-danger"
                    aria-label={`Remove ${traveler.firstName}`}
                    onClick={() => handleDelete(traveler._id)}
                  >
                    <i className="isax isax-trash" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showForm && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>{editingId ? "Edit Traveler" : "Add Traveler"}</h5>
                  <button type="button" className="btn-close" onClick={closeForm} />
                </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body pb-0">
                    <div className="row gy-2">
                      <div className="col-lg-6">
                        <label className="form-label">Relationship (optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Spouse, Daughter, Friend"
                          value={form.label}
                          onChange={(e) => setForm({ ...form, label: e.target.value })}
                        />
                      </div>
                      <div className="col-lg-6">
                        <label className="form-label">Passenger Type</label>
                        <select
                          className="form-control"
                          value={form.passengerType}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              passengerType: e.target.value as "adult" | "child" | "infant",
                            })
                          }
                        >
                          <option value="adult">Adult</option>
                          <option value="child">Child</option>
                          <option value="infant">Infant</option>
                        </select>
                      </div>
                      <div className="col-lg-6">
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.firstName}
                          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        />
                      </div>
                      <div className="col-lg-6">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.lastName}
                          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        />
                      </div>
                      <div className="col-lg-6">
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          value={form.dateOfBirth}
                          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                        />
                      </div>
                      <div className="col-lg-6">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-control"
                          value={form.gender}
                          onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        >
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                        </select>
                      </div>
                      <div className="col-lg-6">
                        <label className="form-label">Passport Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.passport.documentNumber}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              passport: { ...form.passport, documentNumber: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="col-lg-6">
                        <label className="form-label">Passport Expiry</label>
                        <input
                          type="date"
                          className="form-control"
                          value={form.passport.expiryDate}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              passport: { ...form.passport, expiryDate: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="col-lg-6">
                        <label className="form-label">Issuing Country</label>
                        <CustomSelect
                          options={countryOptions}
                          searchable
                          modal
                          className="select d-flex"
                          placeholder="Select Country"
                          value={form.passport.issuingCountry}
                          onChange={(v: any) =>
                            setForm({
                              ...form,
                              passport: {
                                ...form.passport,
                                issuingCountry: v?.value ?? v ?? "",
                              },
                            })
                          }
                        />
                      </div>
                      <div className="col-lg-6">
                        <label className="form-label">Nationality</label>
                        <CustomSelect
                          options={countryOptions}
                          searchable
                          modal
                          className="select d-flex"
                          placeholder="Select Country"
                          value={form.passport.nationality}
                          onChange={(v: any) =>
                            setForm({
                              ...form,
                              passport: {
                                ...form.passport,
                                nationality: v?.value ?? v ?? "",
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light btn-md" onClick={closeForm}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-md">
                      Save Traveler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default SavedTravelers;
