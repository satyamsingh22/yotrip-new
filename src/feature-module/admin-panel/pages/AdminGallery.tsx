import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Images, Upload, Trash2, ShieldAlert } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { rootApi, apiError } from "../adminApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Skeleton,
  Alert,
  AlertDescription,
} from "../ui";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const imgSrc = (url: string) =>
  !url ? "" : url.startsWith("http") ? url : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

const AdminGallery = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await rootApi.get("/gallery");
      setItems(Array.isArray(res.data) ? res.data : res.data.images || []);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const upload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      await rootApi.post("/gallery/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (err) {
      alert(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (g: any) => {
    if (!confirm("Delete this image?")) return;
    try { await rootApi.delete(`/gallery/${g._id}`); await load(); }
    catch (e) { alert(apiError(e)); }
  };

  return (
    <AdminLayout
      title="Gallery"
      crumb="Gallery"
      description="Upload and manage the public-facing gallery images."
      actions={
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="tw-hidden"
            onChange={upload}
          />
          <Button disabled={busy} onClick={() => fileRef.current?.click()}>
            <Upload /> {busy ? "Uploading…" : "Upload Image"}
          </Button>
        </>
      }
    >
      <Card>
        <CardHeader className="tw-flex-row tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center tw-gap-2">
            <Images className="tw-size-5 tw-text-primary" />
            <CardTitle>Gallery Images</CardTitle>
          </div>
          {!loading && <Badge variant="muted">{items.length} images</Badge>}
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="tw-mb-4">
              <ShieldAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="tw-grid tw-gap-4 sm:tw-grid-cols-3 lg:tw-grid-cols-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="tw-h-40 tw-w-full tw-rounded-xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="tw-py-10 tw-text-center tw-text-muted-foreground">
              No images uploaded yet.
            </p>
          ) : (
            <div className="tw-grid tw-gap-4 sm:tw-grid-cols-3 lg:tw-grid-cols-4">
              {items.map((g, i) => (
                <motion.div
                  key={g._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card interactive className="tw-overflow-hidden">
                    <img
                      src={imgSrc(g.url)}
                      alt="gallery"
                      className="tw-h-36 tw-w-full tw-object-cover"
                    />
                    <CardContent className="tw-flex tw-justify-end tw-p-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(g)}
                      >
                        <Trash2 /> Delete
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminGallery;
