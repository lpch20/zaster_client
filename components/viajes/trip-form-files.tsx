"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageData {
  id: string;
  type: "old" | "new";
  url?: string;
  file?: File;
}

interface TripFormFilesProps {
  allImages: ImageData[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (id: string) => void;
}

export function TripFormFiles({
  allImages,
  onFileChange,
  onRemoveImage,
}: TripFormFilesProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="archivos">Subir archivos (máximo 5)</Label>
        <Input
          id="archivos"
          name="archivos"
          type="file"
          multiple
          onChange={onFileChange}
        />
      </div>

      {allImages.length > 0 && (
        <div className="space-y-2">
          <Label>Archivos seleccionados ({allImages.length}/5)</Label>
          <div className="flex flex-wrap gap-2">
            {allImages.map((img) => {
              let src = "";
              let link = "";
              if (img.type === "old") {
                link = `https://drive.google.com/file/d/${img.url}/view?usp=sharing`;
                src = `https://www.googleapis.com/drive/v3/files/${img.url}?alt=media&key=AIzaSyCbrQgBir-rEUavb6X1Q-SUpuGvIlW7Re8`;
              } else {
                src = URL.createObjectURL(img.file!);
              }

              return (
                <div key={img.id} className="relative">
                  <img
                    src={src}
                    alt="Vista previa"
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(img.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                  {img.type === "old" && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-0 left-0 bg-blue-500 text-white text-xs px-1 rounded"
                    >
                      Ver
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

