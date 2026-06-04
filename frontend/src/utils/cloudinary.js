// A function which exports an image to cloudinary so that it can be saved as a URL in the database
export async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned');
    
    const res = await fetch(`https://api.cloudinary.com/v1_1/dk43qmmop/image/upload`, {
        method: 'POST',
        body: formData
    });
    const data = await res.json();
    return data.secure_url;
}