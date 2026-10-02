package com.healthtrackpro.controller;

import com.healthtrackpro.service.PdfReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Downloadable health report generation")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final PdfReportService reportService;

    @GetMapping("/pdf")
    @Operation(summary = "Download a comprehensive PDF health report")
    public ResponseEntity<byte[]> downloadPdf(Authentication auth) {
        byte[] pdf = reportService.generatePdfReport(auth.getName());
        String filename = "healthtrack-report-" + LocalDate.now() + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
