import axios from 'axios'

const api = axios.create({
  // Uses the Vite proxy in dev, so a relative path is sufficient.
  baseURL: '/api',
  timeout: 30000,
})

/**
 * Upload a leaf image to the /diagnose endpoint and return the prediction.
 * @param {File} file - The image file to upload.
 * @returns {Promise<{
 *   filename: string,
 *   disease: string,
 *   confidence: number,
 *   pesticide: string,
 *   dosage: string
 * }>}
 */
export async function diagnoseLeaf(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/diagnose', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}
