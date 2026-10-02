package com.healthtrackpro.service;

import com.healthtrackpro.model.DailyHealthMetrics;
import com.healthtrackpro.model.Goal;
import com.healthtrackpro.model.User;
import com.healthtrackpro.repository.GoalRepository;
import com.healthtrackpro.repository.HealthMetricsRepository;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfReportService {

    private final UserService userService;
    private final HealthMetricsRepository metricsRepository;
    private final GoalRepository goalRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DeviceRgb HEADER_COLOR = new DeviceRgb(37, 99, 235);
    private static final DeviceRgb ROW_ALT_COLOR = new DeviceRgb(239, 246, 255);

    @Transactional(readOnly = true)
    public byte[] generatePdfReport(String email) {
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(30);
        return generateHealthReport(email, from, to);
    }

    @Transactional(readOnly = true)
    public byte[] generateHealthReport(String email, LocalDate from, LocalDate to) {
        User user = userService.getUserByEmail(email);
        List<DailyHealthMetrics> metrics = metricsRepository.findByUserIdAndDateBetween(user.getId(), from, to);
        List<Goal> goals = goalRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document doc = new Document(pdfDoc);

            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            // Title
            Paragraph title = new Paragraph("HealthTrack Pro — Health Report")
                .setFont(boldFont)
                .setFontSize(22)
                .setFontColor(new DeviceRgb(37, 99, 235))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(4);
            doc.add(title);

            // Subtitle: date range
            Paragraph dateRange = new Paragraph(
                String.format("Report Period: %s – %s", from.format(DATE_FMT), to.format(DATE_FMT)))
                .setFont(regularFont)
                .setFontSize(11)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(2);
            doc.add(dateRange);

            // User info
            Paragraph userInfo = new Paragraph(
                String.format("Patient: %s  |  Email: %s  |  Generated: %s",
                    user.getFullName(), user.getEmail(), LocalDate.now().format(DATE_FMT)))
                .setFont(regularFont)
                .setFontSize(10)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
            doc.add(userInfo);

            // Summary stats
            if (!metrics.isEmpty()) {
                addSectionTitle(doc, boldFont, "Summary Statistics");
                addSummaryTable(doc, boldFont, regularFont, metrics);
            }

            // Daily metrics table
            addSectionTitle(doc, boldFont, "Daily Health Metrics");
            if (metrics.isEmpty()) {
                doc.add(new Paragraph("No metrics data available for the selected period.")
                    .setFont(regularFont).setFontSize(11).setMarginTop(8));
            } else {
                addMetricsTable(doc, boldFont, regularFont, metrics);
            }

            // Goals section
            addSectionTitle(doc, boldFont, "Goals Overview");
            if (goals.isEmpty()) {
                doc.add(new Paragraph("No goals defined yet.")
                    .setFont(regularFont).setFontSize(11).setMarginTop(8));
            } else {
                addGoalsTable(doc, boldFont, regularFont, goals);
            }

            // Footer
            doc.add(new Paragraph("\nGenerated by HealthTrack Pro · " + LocalDate.now().format(DATE_FMT))
                .setFont(regularFont)
                .setFontSize(9)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30));

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report: " + e.getMessage(), e);
        }
    }

    private void addSectionTitle(Document doc, PdfFont boldFont, String title) {
        doc.add(new Paragraph(title)
            .setFont(boldFont)
            .setFontSize(14)
            .setFontColor(HEADER_COLOR)
            .setMarginTop(18)
            .setMarginBottom(6));
    }

    private void addSummaryTable(Document doc, PdfFont boldFont, PdfFont regularFont,
                                  List<DailyHealthMetrics> metrics) {
        double avgSteps = metrics.stream().mapToInt(m -> m.getSteps() != null ? m.getSteps() : 0).average().orElse(0);
        double avgCalories = metrics.stream().mapToDouble(m -> m.getCaloriesBurned() != null ? m.getCaloriesBurned() : 0).average().orElse(0);
        double avgWater = metrics.stream().mapToDouble(m -> m.getWaterIntake() != null ? m.getWaterIntake() : 0).average().orElse(0);
        double avgSleep = metrics.stream().mapToDouble(m -> m.getSleepHours() != null ? m.getSleepHours() : 0).average().orElse(0);
        double avgHeartRate = metrics.stream().mapToInt(m -> m.getHeartRate() != null ? m.getHeartRate() : 0)
            .filter(hr -> hr > 0).average().orElse(0);

        Table table = new Table(UnitValue.createPercentArray(new float[]{2f, 2f, 2f, 2f, 2f}))
            .setWidth(UnitValue.createPercentValue(100));

        String[] headers = {"Avg Steps", "Avg Calories", "Avg Water (L)", "Avg Sleep (h)", "Avg Heart Rate"};
        for (String h : headers) {
            table.addHeaderCell(headerCell(h, boldFont));
        }

        table.addCell(dataCell(String.format("%.0f", avgSteps), regularFont, false));
        table.addCell(dataCell(String.format("%.1f kcal", avgCalories), regularFont, false));
        table.addCell(dataCell(String.format("%.1f L", avgWater), regularFont, false));
        table.addCell(dataCell(String.format("%.1f h", avgSleep), regularFont, false));
        table.addCell(dataCell(avgHeartRate > 0 ? String.format("%.0f bpm", avgHeartRate) : "—", regularFont, false));

        doc.add(table);
    }

    private void addMetricsTable(Document doc, PdfFont boldFont, PdfFont regularFont,
                                  List<DailyHealthMetrics> metrics) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1.5f, 1.5f, 1.8f, 1.5f, 1.5f, 1.5f, 1.5f}))
            .setWidth(UnitValue.createPercentValue(100));

        String[] headers = {"Date", "Steps", "Calories", "Water (L)", "Sleep (h)", "Heart Rate", "Weight (kg)"};
        for (String h : headers) {
            table.addHeaderCell(headerCell(h, boldFont));
        }

        boolean alt = false;
        for (DailyHealthMetrics m : metrics) {
            table.addCell(dataCell(m.getDate().format(DATE_FMT), regularFont, alt));
            table.addCell(dataCell(m.getSteps() != null ? String.valueOf(m.getSteps()) : "—", regularFont, alt));
            table.addCell(dataCell(m.getCaloriesBurned() != null ? String.format("%.1f", m.getCaloriesBurned()) : "—", regularFont, alt));
            table.addCell(dataCell(m.getWaterIntake() != null ? String.format("%.1f", m.getWaterIntake()) : "—", regularFont, alt));
            table.addCell(dataCell(m.getSleepHours() != null ? String.format("%.1f", m.getSleepHours()) : "—", regularFont, alt));
            table.addCell(dataCell(m.getHeartRate() != null && m.getHeartRate() > 0 ? m.getHeartRate() + " bpm" : "—", regularFont, alt));
            table.addCell(dataCell(m.getWeight() != null ? String.format("%.1f", m.getWeight()) : "—", regularFont, alt));
            alt = !alt;
        }
        doc.add(table);
    }

    private void addGoalsTable(Document doc, PdfFont boldFont, PdfFont regularFont, List<Goal> goals) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{2f, 1.5f, 1.5f, 1.5f, 1.5f, 1.5f}))
            .setWidth(UnitValue.createPercentValue(100));

        String[] headers = {"Goal Type", "Target", "Progress", "Progress %", "End Date", "Status"};
        for (String h : headers) {
            table.addHeaderCell(headerCell(h, boldFont));
        }

        boolean alt = false;
        for (Goal g : goals) {
            table.addCell(dataCell(g.getGoalType().name().replace("_", " "), regularFont, alt));
            table.addCell(dataCell(String.format("%.1f", g.getTargetValue()), regularFont, alt));
            table.addCell(dataCell(String.format("%.1f", g.getCurrentProgress()), regularFont, alt));
            table.addCell(dataCell(String.format("%.1f%%", g.getProgressPercentage()), regularFont, alt));
            table.addCell(dataCell(g.getEndDate().format(DATE_FMT), regularFont, alt));
            table.addCell(dataCell(Boolean.TRUE.equals(g.getIsAchieved()) ? "✓ Achieved" : "In Progress", regularFont, alt));
            alt = !alt;
        }
        doc.add(table);
    }

    private Cell headerCell(String text, PdfFont boldFont) {
        return new Cell()
            .add(new Paragraph(text).setFont(boldFont).setFontSize(10).setFontColor(ColorConstants.WHITE))
            .setBackgroundColor(HEADER_COLOR)
            .setPadding(6)
            .setTextAlignment(TextAlignment.CENTER);
    }

    private Cell dataCell(String text, PdfFont regularFont, boolean alt) {
        Cell cell = new Cell()
            .add(new Paragraph(text).setFont(regularFont).setFontSize(9))
            .setPadding(5)
            .setTextAlignment(TextAlignment.CENTER);
        if (alt) cell.setBackgroundColor(ROW_ALT_COLOR);
        return cell;
    }
}
