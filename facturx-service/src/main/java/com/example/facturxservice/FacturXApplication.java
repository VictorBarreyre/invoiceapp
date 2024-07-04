package com.example.facturxservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@SpringBootApplication
@RestController
@RequestMapping("/generate-facturx")
public class FacturXApplication {

    private final FacturXService facturXService;

    @Autowired
    public FacturXApplication(FacturXService facturXService) {
        this.facturXService = facturXService;
    }

    @PostMapping
    public byte[] generateFacturX(@RequestBody String invoiceData) throws IOException {
        return facturXService.generateFacturX(invoiceData);
    }

    public static void main(String[] args) {
        SpringApplication.run(FacturXApplication.class, args);
    }
}
