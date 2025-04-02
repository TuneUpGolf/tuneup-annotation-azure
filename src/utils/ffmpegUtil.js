import ffmpeg from 'fluent-ffmpeg';

export function createVideoFromImages(imagePaths, outputFilePath) {
    return new Promise((resolve, reject) => {
        // Construct FFmpeg command
        const command = ffmpeg();

        // Add each image as an input
        imagePaths.forEach(imagePath => {
            command.input(imagePath);
        });

        command
            .on('end', () => {
                console.log('Video created successfully');
                resolve();
            })
            .on('error', (err) => {
                console.error('Error creating video:', err);
                reject(err);
            })
            .mergeToFile(outputFilePath);
    });
}
