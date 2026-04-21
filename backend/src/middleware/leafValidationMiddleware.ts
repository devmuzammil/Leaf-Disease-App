import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import FormData from 'form-data';

const leafValidationMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('Leaf detection started');

    try {
        const form = new FormData();
        const fileStream = fs.createReadStream(req.file!.path);
        form.append('file', fileStream, {
            filename: req.file!.originalname || 'image.jpg',
            contentType: req.file!.mimetype,
        });

        const response = await axios.post('https://a-rehman-12-leafvsnon-leaf.hf.space/predict', form, {
            headers: {
                ...form.getHeaders(),
            },
            timeout: 15000,
        });

        const result = response.data;
        console.log('Leaf detection result:', result);

        // Check for leaf in various possible response formats
        const isLeaf = result.is_leaf === true || result.label === 'leaf' || result.prediction === 'leaf';

        (req as any).isLeaf = isLeaf;

        if (!isLeaf) {
            console.log('Image is not a leaf, proceeding to prediction controller');
        } else {
            console.log('Passing to disease prediction');
        }
        next();
    } catch (error) {
        console.error('Leaf detection error:', error);
        res.json({ success: false, message: 'Leaf detection failed' });
    }
};

export default leafValidationMiddleware;