import { API } from "@/utils/apiRequest";
import { useState, useCallback } from "react";

const useApi = (config = {}) => {
  const {
    method = "get",
    url = "",
    auto = false,
    body = null,
    params = null,
    headers = {},
  } = config;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(auto);

  const request = useCallback(
    async (override = {}) => {
      setLoading(true);
      setError(null);

      try {
        const res = await API({
          method: override.method || method,
          url: override.url || url,
          data: override.body || body,
          params: override.params || params,
          headers: {
            ...headers,
            ...(override.headers || {}),
          },
        });

        setData(res.data);
        return res.data;
      } catch (err) {
        setError(err?.response?.data || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [method, url, body, params, headers],
  );

  // auto call on mount if needed
  // (use carefully)
  // useEffect(() => {
  //   if (auto) request();
  // }, []);

  const uploadFile = useCallback(
    async (file, extraData = {}) => {
      const formData = new FormData();

      formData.append("file", file);

      Object.keys(extraData).forEach((key) => {
        formData.append(key, extraData[key]);
      });

      return request({
        method: "post",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    [request],
  );

  return {
    data,
    error,
    loading,
    request,
    uploadFile,
  };
};

export default useApi;
