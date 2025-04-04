"use client";

import { useEffect, useState } from "react";
import { DbUser, UserSearchResult } from "@/types/user";
import { useTranslations } from "next-intl";
import { useThrottle } from "@/hooks/use-throttle";

type FormFieldProps = {
  label: string;
  id: string;
  type?: "text" | "email" | "number" | "textarea";
  disabled?: boolean;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;
  description?: string | null;
};

const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = "text",
  disabled = false,
  value,
  onChange,
  className = "",
  description,
}) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={id} className="font-semibold">
      {label}
    </label>
    {type === "textarea" ? (
      <textarea
        id={id}
        name={id}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={`p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition ${className}`}
      />
    ) : (
      <input
        type={type}
        id={id}
        name={id}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={`p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition ${className}`}
      />
    )}
    {description && <p className="text-sm text-gray-500">{description}</p>}
  </div>
);

export default function UserForm({ user }: { user: DbUser }) {
  const t = useTranslations("UserForm");

  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    username: user.username || "",
    favoritePeople: user.favorite?.map((f) => f.id).join(", ") || "",
    quote: user.quote || "",
    promoYear: user.promo || 2025,
    promoCustom: typeof user.promo === "string" ? user.promo : "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [searchTerm, setSearchTerm] = useState("");
  const throttledSearchTerm = useThrottle(searchTerm, 100);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState(user.favorite || []);

  useEffect(() => {
    const searchUsers = async () => {
      if (throttledSearchTerm.length < 2) {
        setSearchResults([]);
        return;
      }  

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/users/search?query=${encodeURIComponent(searchTerm)}`
        );
        const data = await response.json();
        setSearchResults(data.users);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [throttledSearchTerm, searchTerm]);

  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const addFavorite = (user: UserSearchResult) => {
    if (!favorites.some((f) => f.id === user.id) || favorites.length >= 3) {
      const newFavorites = [...favorites, user];
      setFavorites(newFavorites);
      setSearchTerm("");
      setSearchResults([]);
      setFormData((prev) => ({
        ...prev,
        favoritePeople: newFavorites.map((f) => f.id).join(", "),
      }));
    }
  };

  const removeFavorite = (userId: string) => {
    if (!favorites.some((f) => f.id === userId)) return;
    const newFavorites = favorites.filter((f) => f.id !== userId);
    setFavorites(newFavorites);
    setFormData((prev) => ({
      ...prev,
      favoritePeople: newFavorites.map((f) => f.id).join(", "),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const dataToSubmit = {
      ...user,
      username: formData.username,
      favorite: formData.favoritePeople
        .split(",")
        .map((name) => ({ name: name.trim() })),
      quote: formData.quote,
      promo: formData.promoCustom || formData.promoYear,
    };

    fetch("/api/users/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSubmit),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(t("updateSuccess")); // FIXME: use toast
        } else {
          alert(t("updateError")); // FIXME: use toast
        }
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        alert(t("updateError"));
      });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-3 max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold">{t("accountSettings")}</h2>

      <div className="grid gap-6 grid-cols-2">
        <FormField
          label={t("name")}
          id="name"
          disabled={true}
          value={formData.name}
          onChange={handleChange}
          description={null}
        />

        <FormField
          label={t("email")}
          id="email"
          type="email"
          disabled={true}
          value={formData.email}
          onChange={handleChange}
          description={null}
        />
      </div>

      <FormField
        label={t("username")}
        id="username"
        value={formData.username}
        onChange={handleChange}
        description={null}
      />

      <div className="flex flex-col space-y-1">
        <label htmlFor="favoritePeople" className="font-semibold">
          {t("favoritePeople")}
        </label>
        <input
          type="text"
          id="searchUser"
          value={searchTerm}
          onChange={handleUserSearch}
          placeholder={t("searchUsers")}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition"
        />
        <p className="text-sm text-gray-500">
          {t("favoritePeopleDescription")}
        </p>

        {searchResults.length > 0 && (
          <div className="mt-2 border rounded-lg ">
            <ul className="divide-y">
              {searchResults.map((result) => (
                <li
                  key={result.id}
                  className="p-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => addFavorite(result)}
                >
                  <span>{result.name}</span>
                  <button
                    type="button"
                    className="text-blue-500 hover:text-blue-700 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      addFavorite(result);
                    }}
                  >
                    {t("add")}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isSearching && (
          <p className="text-sm text-gray-500">{t("searching")}...</p>
        )}
      </div>

      {favorites.length > 0 && (
        <div className="border rounded-lg p-3 bg-gray-50">
          <h3 className="font-medium mb-2">{t("selectedFavorites")}</h3>
          <ul className="space-y-1">
            {favorites.map((f) => (
              <li key={f.id} className="flex items-center justify-between">
                <span>{f.name}</span>
                <button
                  type="button"
                  onClick={() => removeFavorite(f.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  {t("remove")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <FormField
        label={t("quote")}
        id="quote"
        type="textarea"
        value={formData.quote}
        onChange={handleChange}
        description={t("quoteDescription")}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label={t("promoYear")}
          id="promoYear"
          type="number"
          value={formData.promoYear}
          onChange={handleChange}
          description={t("promoYearDescription")}
        />

        <FormField
          label={t("promoCustom")}
          id="promoCustom"
          value={formData.promoCustom}
          onChange={handleChange}
          description={t("promoCustomDescription")}
        />
      </div>

      <div className="flex justify-end mt-4 space-x-3">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition focus:ring-2 focus:ring-blue-300"
        >
          {t("save")}
        </button>
      </div>
    </form>
  );
}
