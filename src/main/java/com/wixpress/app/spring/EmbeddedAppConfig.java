package com.wixpress.app.spring;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.wixpress.app.controller.AppController;
import com.wixpress.app.controller.HelpController;
import com.wixpress.app.dao.AppDao;
import com.wixpress.app.dao.AppGaeDao;
import com.wixpress.app.domain.AuthenticationResolver;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

/**
 * Created by : doron
 * Since: 7/1/12
 */

@Configuration
@Import({EmbeddedAppVelocityBeansConfig.class})
public class EmbeddedAppConfig {
    @Bean
    public ObjectMapper objectMapper() { //TODO remove FAIL_ON_UNKNOWN_PROPERTIES feature
        //.configure(DeserializationConfig.Feature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return new ObjectMapper();
    }

    @Bean
    public AppController appController() {
        return new AppController();
    }

    @Bean
    public HelpController helloWorldController() {
        return new HelpController();
    }

    @Bean
    public AppDao sampleAppDap() {
        return new AppGaeDao();
    }

    @Bean
    public DatastoreService dataStore() {
        return DatastoreServiceFactory.getDatastoreService();
    }

    @Bean
    public AuthenticationResolver authenticationResolver() {
        return new AuthenticationResolver(objectMapper());
    }

    //TODO add path resolver as a bean
}
