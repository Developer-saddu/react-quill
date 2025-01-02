import React, { Component } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageUploader from "quill-image-uploader";
import ImageResize from "quill-image-resize-module-react";
import "react-quill/dist/quill.snow.css";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// Register Quill modules
Quill.register("modules/imageUploader", ImageUploader);
Quill.register("modules/imageResize", ImageResize);

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorHtml: "",
      crop: { aspect: 16 / 9 }, // Aspect ratio for cropping
      croppedImage: null, // Holds cropped image
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(html) {
    this.setState({ editorHtml: html });
  }

  // Handle image upload and cropping
  handleCropChange = (crop) => {
    this.setState({ crop });
  };

  handleImageLoaded = (image) => {
    this.imageRef = image;
  };

  handleCropComplete = async (crop) => {
    const croppedImage = await this.getCroppedImg(
      this.imageRef,
      crop,
      "croppedImage.jpeg"
    );
    this.setState({ croppedImage });
  };

  getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        blob.name = fileName;
        const fileUrl = URL.createObjectURL(blob);
        resolve(fileUrl);
      }, "image/jpeg");
    });
  }

  modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
    imageUploader: {
      upload: (file) => {
        return new Promise((resolve, reject) => {
          const formData = new FormData();
          formData.append("image", file);

          fetch(
            "https://api.imgbb.com/1/upload?key=334ecea9ec1213784db5cb9a14dac265",
            {
              method: "POST",
              body: formData,
            }
          )
            .then((response) => response.json())
            .then((result) => {
              resolve(result.data.url);
            })
            .catch((error) => {
              reject("Upload failed");
              console.error("Error:", error);
            });
        });
      },
    },
    imageResize: {}, // Add image resizing
  };

  formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  render() {
    return (
      <div>
        {/* Render Cropping UI */}
        <ReactCrop
          src={this.state.croppedImage || ""}
          crop={this.state.crop}
          onChange={this.handleCropChange}
          onImageLoaded={this.handleImageLoaded}
          onComplete={this.handleCropComplete}
        />
        <ReactQuill
          value={this.state.editorHtml}
          onChange={this.handleChange}
          modules={this.modules}
          formats={this.formats}
          style={{ minHeight: "25vh" }}
        />
      </div>
    );
  }
}

export default Editor;
