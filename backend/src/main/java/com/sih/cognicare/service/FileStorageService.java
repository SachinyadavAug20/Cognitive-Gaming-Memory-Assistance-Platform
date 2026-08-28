package com.sih.cognicare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadRoot;

    public FileStorageService(@Value("${app.upload.dir:./uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public void initPatientDirs(Long patientId) {
        try {
            Files.createDirectories(getPatientDir(patientId).resolve("photos"));
            Files.createDirectories(getPatientDir(patientId).resolve("reports"));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directories for patient " + patientId, e);
        }
    }

    public String saveFile(MultipartFile file, Long patientId, String subfolder) {
        try {
            initPatientDirs(patientId);
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID() + extension;
            Path targetDir = getPatientDir(patientId).resolve(subfolder);
            Path targetPath = targetDir.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return "patients/" + patientId + "/" + subfolder + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file", e);
        }
    }

    public Resource loadFile(String relativePath) {
        try {
            Path filePath = uploadRoot.resolve(relativePath).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            }
            throw new RuntimeException("File not found: " + relativePath);
        } catch (MalformedURLException e) {
            throw new RuntimeException("File path invalid: " + relativePath, e);
        }
    }

    private Path getPatientDir(Long patientId) {
        return uploadRoot.resolve("patients").resolve(String.valueOf(patientId));
    }
}
