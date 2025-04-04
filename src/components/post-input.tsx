"use client";

import { createPost } from "@/app/actions";
import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface PostInputProps {
  userId: string;
}

export default function PostInput({ userId }: PostInputProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (title.trim() === "" || content.trim() === "") return;

    setIsLoading(true);
    try {
      await createPost({ title, content, userId });
      setTitle("");
      setContent("");
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la création du post", error);
    } finally {
      setIsLoading(false);
    }

  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-2">Créer un nouveau post</h2>
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre du post"
        className="w-full p-2 border rounded-lg mb-2"
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Écris ton post ici..."
        className="w-full p-2 border rounded-lg min-h-[100px]"
      />
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full mt-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {isLoading ? "Envoi..." : "Publier"}
      </Button>
    </div>
  );
} 
