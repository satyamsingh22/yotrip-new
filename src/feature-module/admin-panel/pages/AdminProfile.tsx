import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ShieldAlert, UserRound } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { rootApi, apiError } from "../adminApi";
import { useAdminAuthContext } from "../AdminAuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Button,
  Alert,
  AlertDescription,
} from "../ui";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const FALLBACK_AVATAR = "/assets/img/users/user-lg-26.jpg";

/** Self-service profile editor for the signed-in admin. */
const AdminProfile = () => {
  const { admin } = useAdminAuthContext();
  const adminId = admin?._id;

  const [form, setForm] = useState({
    name: "",
    designation: "",
    email: "",
    phone: "",
  });
  const [profileImage, setProfileImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!adminId) return;
    let active = true;

    rootApi
      .get(`/auth/admin/${adminId}`)
      .then((res) => {
        if (!active) return;
        const data = res.data ?? {};
        setForm({
          name: data.name ?? "",
          designation: data.designation ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
        });
        setProfileImage(data.profileImage ?? "");
      })
      .catch((err) => {
        if (active) setError(apiError(err));
      });

    return () => {
      active = false;
    };
  }, [adminId]);

  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaved(false);
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaved(false);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) return;

    setError("");
    setSaved(false);
    setBusy(true);

    try {
      // The text-field update runs first so a failure here never leaves a new
      // avatar persisted server-side while the UI reports the save as failed.
      await rootApi.put(`/auth/admin/update/${adminId}`, {
        name: form.name,
        designation: form.designation,
        phone: form.phone,
      });

      if (selectedFile) {
        const body = new FormData();
        body.append("profileImage", selectedFile);
        // Content-Type (with boundary) is set by the browser for FormData.
        const res = await rootApi.post(
          `/auth/admin/upload-image/${adminId}`,
          body
        );
        setProfileImage(res.data?.profileImage ?? profileImage);
        clearImage();
      }

      setSaved(true);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const avatarSrc =
    preview ||
    (profileImage ? `${BASE_URL}${profileImage}` : FALLBACK_AVATAR);

  return (
    <AdminLayout
      title="My profile"
      crumb="Profile"
      description="Update the name, designation, phone, and photo shown on your admin account."
    >
      <Card className="tw-max-w-2xl">
        <CardHeader className="tw-flex-row tw-items-center tw-gap-2">
          <UserRound className="tw-size-5 tw-text-primary" />
          <CardTitle>Edit profile</CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="tw-mb-4">
              <ShieldAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {saved && (
            <Alert variant="info" className="tw-mb-4">
              <CheckCircle2 />
              <AlertDescription>Profile updated</AlertDescription>
            </Alert>
          )}

          <form onSubmit={submit} className="tw-space-y-6">
            <div className="tw-flex tw-items-center tw-gap-4">
              <img
                src={avatarSrc}
                alt=""
                className="tw-size-20 tw-shrink-0 tw-rounded-xl tw-object-cover tw-ring-1 tw-ring-inset tw-ring-border"
              />
              <div className="tw-space-y-2">
                <p className="tw-text-sm tw-text-muted-foreground">
                  Recommended dimensions: 400 × 400 pixels.
                </p>
                <div className="tw-flex tw-gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    Upload
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearImage}
                    disabled={!selectedFile}
                  >
                    Remove
                  </Button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="tw-hidden"
                  onChange={pickImage}
                />
              </div>
            </div>

            <div className="tw-grid tw-gap-4 sm:tw-grid-cols-2">
              <div className="tw-space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={change}
                  required
                />
              </div>
              <div className="tw-space-y-1.5">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  name="designation"
                  value={form.designation}
                  onChange={change}
                />
              </div>
              <div className="tw-space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" value={form.email} disabled />
              </div>
              <div className="tw-space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={change}
                />
              </div>
            </div>

            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminProfile;
