<?php

// ========================================
// EMERGENCY: DISABLE DONATION EMAILS
// ========================================
define('MSB_EMAILS_DISABLED', true);

// Block donation-related emails from being sent
add_filter('pre_wp_mail', function($null, $atts) {
    if (!defined('MSB_EMAILS_DISABLED') || !MSB_EMAILS_DISABLED) {
        return $null;
    }
    $subject = $atts['subject'] ?? '';
    $to = $atts['to'] ?? '';
    // Block donation-related emails
    if (stripos($subject, 'დონაცია') !== false || 
        stripos($subject, 'donation') !== false ||
        stripos($subject, 'მადლობა') !== false ||
        stripos($subject, 'გადახდა') !== false ||
        stripos($subject, 'recurring') !== false) {
        error_log("[EMAIL BLOCKED] To: $to | Subject: $subject");
        return true; // Prevents email from sending
    }
    return $null;
}, 10, 2);
// ========================================

// ========================================
// SAFETY: DISABLE ALL BACKFILL TOOLS
// ========================================
define('MSB_BACKFILL_DISABLED', true);
// ========================================

/**
 * Registers all custom REST API endpoints for the theme.
 */





// PhpSpreadsheet autoloader
require_once get_stylesheet_directory() . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Pdf\Dompdf as PdfWriter;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx as XlsxWriter;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;



function twentytwentyfour_register_rest_endpoints()
{
    register_rest_route('wp/v2', '/submit-donation/', array(
        'methods' => 'POST',
        'callback' => 'handle_donation',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('wp/v2', '/acf-fields/', array(
        'methods' => 'GET',
        'callback' => 'get_all_acf_fields_with_sorting',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('wp/v2', '/videos/', array(
        'methods' => 'GET',
        'callback' => 'get_all_videos_with_acf',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('wp/v2', '/subscribe/', array(
        'methods' => WP_REST_Server::CREATABLE,
        'callback' => 'handle_subscribe_request',
        'permission_callback' => '__return_true'
    ));

    register_rest_field('post', 'modified', array(
        'get_callback' => function ($post_arr) {
            return get_post_modified_time('c', false, $post_arr['ID']);
        },
    ));

    $custom_post_types = array('kalaki', 'main', 'mau-books', 'mecniereba', 'medicina', 'msoflio', 'saxli', 'shroma', 'xelovneba', 'article', 'resursebi', 'ekonomika');
    foreach ($custom_post_types as $post_type) {
        register_rest_field($post_type, 'modified', array(
            'get_callback' => function ($post_arr) {
                return get_post_modified_time('c', false, $post_arr['ID']);
            },
        ));
    }

    register_rest_route('custom/v1', '/sporti-videos', array(
        'methods' => 'GET',
        'callback' => 'get_all_sporti_videos',
        'permission_callback' => '__return_true'
    ));

    // Enforce /normalize next_payment_date into YYYYMMDD
    register_rest_route('custom/v1', '/donation/(?P<id>\d+)/next-payment-date', [
        'methods' => 'POST',
        'permission_callback' => function () {
            return current_user_can('administrator');
        },
        'callback' => function (WP_REST_Request $req) {
            $id = (int) $req->get_param('id');
            $raw = $req->get_param('next_payment_date');
            // normalize any format into 8-digit YYYYMMDD
            if (!preg_match('/^\d{8}$/', $raw)) {
                $raw = normalize_date_to_ymd($raw);
            }
            update_post_meta($id, 'next_payment_date', $raw);
            return rest_ensure_response([
                'post' => $id,
                'next_payment_date' => $raw,
            ]);
        },
    ]);
}
add_action('rest_api_init', 'twentytwentyfour_register_rest_endpoints');

function handle_subscribe_request(WP_REST_Request $request)
{
    $email = sanitize_email($request->get_param('email'));
    error_log('Form submitted with email: ' . $email);

    if (!is_email($email)) {
        error_log('Invalid email submitted');
        return new WP_Error('invalid_email', 'The email address is invalid.', array('status' => 400));
    }

    $post_id = wp_insert_post(array(
        'post_type' => 'subscriber',
        'post_title' => $email,
        'post_status' => 'publish',
    ));

    if (is_wp_error($post_id)) {
        error_log('Error creating subscriber post: ' . $post_id->get_error_message());
        return $post_id;
    }

    update_post_meta($post_id, 'subscriber_email', $email);
    error_log('Subscriber email meta saved with email: ' . get_post_meta($post_id, 'subscriber_email', true));
    error_log('Subscriber post created with ID: ' . $post_id);

    // Trigger the sync function explicitly after saving meta data
    sync_subscriber_to_service($post_id, get_post($post_id), false);

    return new WP_REST_Response(array('status' => 'success', 'post_id' => $post_id), 200);
}

function sync_subscriber_to_service($post_id, $post, $update)
{
    error_log('sync_subscriber_to_service function triggered for post ID: ' . $post_id);

    // Ensure we're working only with the 'subscriber' post type
    if ($post->post_type != 'subscriber' || $update) {
        error_log('Post type not subscriber or it is an update');
        return;
    }

    // Get the email field using get_post_meta
    $email = get_post_meta($post_id, 'subscriber_email', true);
    error_log('Retrieved email from post meta for post ID ' . $post_id . ': ' . $email);

    if (empty($email) || !is_email($email)) {
        error_log('Invalid or missing email address for post ID: ' . $post_id);
        return;
    }

    // Retrieve the API key from wp-config.php
    $apiKey = BREVO_API_KEY;
    $apiUrl = 'https://api.sendinblue.com/v3/contacts';
    $listId = 2; // Ensure this is the correct list ID in Brevo

    $body = [
        'email' => $email,
        'listIds' => [$listId],
        'updateEnabled' => true
    ];

    $response = wp_remote_post($apiUrl, [
        'method' => 'POST',
        'headers' => [
            'api-key' => $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ],
        'body' => json_encode($body)
    ]);

    // Log the entire request for debugging
    error_log('Request body: ' . json_encode($body));

    if (is_wp_error($response)) {
        error_log('API Request Error: ' . $response->get_error_message());
    } else {
        $statusCode = wp_remote_retrieve_response_code($response);
        $responseBody = wp_remote_retrieve_body($response);
        error_log('Response status code: ' . $statusCode);
        error_log('Response body: ' . $responseBody);

        if ($statusCode == 201 || $statusCode == 204) {
            error_log('Subscriber successfully added/updated: ' . $email);
        } else {
            error_log('Failed to add/update subscriber: ' . $email . '; Status code: ' . $statusCode . '; Response: ' . $responseBody);
        }
    }
}

add_action('save_post', 'sync_subscriber_to_service', 10, 3);

function get_all_sporti_videos(WP_REST_Request $request)
{
    $page = $request->get_param('page') ? $request->get_param('page') : 1;
    $per_page = $request->get_param('per_page') ? $request->get_param('per_page') : 20;

    $args = array(
        'post_type' => 'sporti-videos',
        'posts_per_page' => $per_page,
        'paged' => $page,
    );

    $query = new WP_Query($args);

    if (!$query->have_posts()) {
        return new WP_Error('no_videos', 'No videos found', array('status' => 404));
    }

    $videos = array();
    while ($query->have_posts()) {
        $query->the_post();
        $videos[] = array(
            'id' => get_the_ID(),
            'date' => get_the_date(),
            'title' => get_the_title(),
            'acf' => get_fields(),
        );
    }
    wp_reset_postdata();

    return rest_ensure_response($videos);
}

function get_all_acf_fields_with_sorting()
{


    $args = array(
        'post_type' => array(
            'post',
            'article',
            'main',
            'kalaki',
            'mau-books',
            'mecniereba',
            'medicina',
            'msoflio',
            'saxli',
            'shroma',
            'xelovneba',
            'resursebi',
            'ekonomika',
            'targmani',
            'free-column'
        ),
        'posts_per_page' => 4,
        'meta_query' => array(
            array(
                'key' => 'rcheuli',
                'value' => '1',
                'compare' => '='
            )
        ),
        'orderby' => 'modified',
        'order' => 'DESC'
    );

    $query = new WP_Query($args);



    $posts = array();

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $fields = get_fields();
            $posts[] = array(
                'post_id' => get_the_ID(),
                'title' => get_the_title(),
                'modified' => get_the_modified_time('c'),
                'acf_fields' => $fields,
                'post_type' => get_post_type()
            );
        }
    } else {
        error_log('No posts found for meta query.');
    }

    wp_reset_postdata();
    return rest_ensure_response($posts);
}

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/acf-fields', array(
        'methods' => 'GET',
        'callback' => 'get_all_acf_fields_with_sorting',
        'permission_callback' => '__return_true',
    ));
});


add_filter('acf/update_value/name=rcheuli', function ($value, $post_id, $field) {
    return $value ? '1' : '0'; // Save as '1' when checked, '0' otherwise.
}, 10, 3);


//revalidation

function trigger_nextjs_revalidation($post_id)
{
    // Avoid infinite loops from autosaves.
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        error_log("Autosave detected for Post ID: {$post_id}. Skipping.");
        return;
    }

    // Log that the function was triggered.
    error_log("trigger_nextjs_revalidation called for Post ID: {$post_id}");

    // Get and log the post type.
    $post_type = get_post_type($post_id);
    error_log("Post type for ID {$post_id}: {$post_type}");

    // Ensure the post type is 'article'.
    if ($post_type !== 'article') {
        error_log("Post ID {$post_id} is not an 'article'. Skipping revalidation.");
        return;
    }

    // Prepare revalidation URL.
    $nextjs_url = 'https://www.mautskebeli.ge/api/revalidate';
    $secret = '9bb942af405cf6a70b26e47b073620a17e4aeebafc79dc8edca105ff096a4f8a';
    $id = $post_id;

    $revalidate_url = add_query_arg(
        array(
            'secret' => $secret,
            'id' => $id,
        ),
        $nextjs_url
    );

    // Log the generated revalidation URL.
    error_log("Revalidate URL for Post ID {$post_id}: {$revalidate_url}");

    // Make the GET request to Next.js.
    $response = wp_remote_get($revalidate_url);

    // Log the response or error.
    if (is_wp_error($response)) {
        error_log("Revalidation failed for Post ID {$post_id}: " . $response->get_error_message());
    } else {
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        error_log("Revalidation response for Post ID {$post_id}: {$status_code} - {$body}");
    }
}
add_action('save_post', 'trigger_nextjs_revalidation');


add_action('save_post', function ($post_id) {
    error_log("save_post triggered for Post ID: {$post_id}");
});






// free column api

function add_acf_to_free_column_api($data, $post, $context)
{
    $fields = get_fields($post->ID);

    if ($fields) {
        // Ensure 'main-text' is processed correctly
        if (isset($fields['main-text'])) {
            $fields['main-text'] = apply_filters('acf_the_content', $fields['main-text']);
        }

        // Ensure 'image' is a valid URL
        if (isset($fields['image'])) {
            $image = $fields['image'];
            if (is_numeric($image)) {
                $image_url = wp_get_attachment_url($image);
                $fields['image'] = $image_url ? $image_url : null;
            } elseif (!filter_var($image, FILTER_VALIDATE_URL)) {
                $fields['image'] = home_url($image);
            }
        }

        // Attach ACF fields to the API response
        $data->data['acf'] = $fields;
    } else {
        error_log('ACF fields are missing for post ID: ' . $post->ID);
    }

    return $data;
}
add_filter('rest_prepare_free-column', 'add_acf_to_free_column_api', 10, 3);





function filter_main_posts()
{
    $args = array(
        'post_type' => array(
            'article',
            'kalaki',
            'main',
            'mau-books',
            'mecniereba',
            'medicina',
            'msoflio',
            'saxli',
            'shroma',
            'xelovneba',
            'ekonomika',
            'resursebi',
        ),
        'meta_query' => array(
            array(
                'key' => 'mtavari',
                'value' => '1',
                'compare' => '='
            )
        ),
        'meta_key' => 'main_page_image',
    );

    $query = new WP_Query($args);
    $posts = array();

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $posts[] = array(
                'id' => get_the_ID(),
                'title' => get_the_title(),
                'image' => get_field('main_page_image'),
                'post_type' => get_post_type(), // Add post type
                'link' => get_permalink(),
            );
        }
        wp_reset_postdata();
    }

    wp_send_json($posts);
}

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/main-posts', array(
        'methods' => 'GET',
        'callback' => 'filter_main_posts',
        'permission_callback' => '__return_true',
    ));
});


// Add this function near other REST API functions
function add_acf_to_json_api($data, $post, $context)
{
    // Retrieve all ACF fields for the post
    $fields = get_fields($post->ID);

    if ($fields) {
        foreach ($fields as $key => $value) {
            if ($key === 'main-text') { // Replace with your WYSIWYG field key
                // Pass WYSIWYG content as-is
                $fields[$key] = apply_filters('acf_the_content', $value);
            }
        }

        $data->data['acf'] = $fields; // Attach the ACF fields to the REST API response
    }

    return $data;
}
add_filter('rest_prepare_post', 'add_acf_to_json_api', 10, 3);



// Example registration of 'free-column' post type
function register_free_column_post_type()
{
    register_post_type('free-column', array(
        'label' => 'Free Columns',
        'public' => true,
        'show_in_rest' => true, // Ensure this is set to true
        'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'has_archive' => true,
        'rewrite' => array('slug' => 'free-column'),
        // ... other arguments as needed
    ));
}
add_action('init', 'register_free_column_post_type');



function get_all_videos_with_acf()
{
    $args = array(
        'post_type' => array('post', 'article', 'kalaki', 'main', 'mau-books', 'mecniereba', 'medicina', 'msoflio', 'saxli', 'shroma', 'xelovneba', 'resursebi', 'ekonomika'),
        'posts_per_page' => -1,
        'meta_query' => array(
            array(
                'key' => 'video_url',
                'value' => '',
                'compare' => '!='
            )
        )
    );

    $query = new WP_Query($args);
    $videos = array();

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $video_url = get_field('video_url');
            if ($video_url) {
                $videos[] = array(
                    'post_id' => get_the_ID(),
                    'title' => get_the_title(),
                    'video_url' => $video_url,
                    'post_type' => get_post_type() // Add post_type to the response
                );
            }
        }
    }

    wp_reset_postdata();

    return rest_ensure_response($videos);
}

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/all_videos', array(
        'methods' => 'GET',
        'callback' => 'get_all_videos_with_acf',
        'permission_callback' => '__return_true',
    ));
});

// WP-CLI command to sync existing subscribers
if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('sync_subscribers', function () {
        $args = array(
            'post_type' => 'subscriber',
            'posts_per_page' => -1,
        );

        $query = new WP_Query($args);

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $post_id = get_the_ID();
                $post = get_post($post_id);

                sync_subscriber_to_service($post_id, $post, false);
            }
        }

        wp_reset_postdata();

        WP_CLI::success('All subscribers have been synced to Brevo.');
    });
}

// CORS Headers
function add_cors_http_header()
{
    if (!headers_sent()) {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Access-Control-Allow-Credentials: true");
    }
}

function add_cors_to_rest_api($value)
{
    add_cors_http_header();
    return $value;
}

add_action('init', 'add_cors_http_header');
add_filter('rest_pre_serve_request', 'add_cors_to_rest_api');

//from here

// Add font size and alignment options to ACF WYSIWYG toolbar
function customize_acf_wysiwyg_toolbar($toolbars)
{
    // Add 'fontsizeselect' and alignment options to the Full toolbar
    if (isset($toolbars['Full'])) {
        $toolbars['Full'][1][] = 'fontsizeselect'; // Built-in font size dropdown
        $toolbars['Full'][1][] = 'alignleft';
        $toolbars['Full'][1][] = 'aligncenter';
        $toolbars['Full'][1][] = 'alignright';
        $toolbars['Full'][1][] = 'alignjustify';
    }
    return $toolbars;
}
add_filter('acf/fields/wysiwyg/toolbars', 'customize_acf_wysiwyg_toolbar');

// Configure TinyMCE to allow inline font size styles
function customize_tinymce_settings($initArray)
{
    // Allow all valid elements and extended elements with inline styles
    $initArray['valid_elements'] = '*[*]';
    $initArray['extended_valid_elements'] = '*[*]';

    // Set font size options for the 'fontsizeselect' dropdown
    $initArray['fontsize_formats'] = '8px 10px 12px 14px 16px 18px 24px 36px 48px 60px 72px 96px';

    return $initArray;
}
add_filter('tiny_mce_before_init', 'customize_tinymce_settings');

// Preserve all font size inline styles when saving content
function preserve_acf_wysiwyg_content($value, $post_id, $field)
{
    // Define allowed HTML tags and attributes for sanitization
    $allowed_tags = [
        'p' => ['style' => []],
        'span' => ['style' => []],
        'strong' => [],
        'em' => [],
        'a' => ['href' => [], 'title' => [], 'style' => []],
        'ul' => [],
        'ol' => [],
        'li' => [],
        'br' => [],
        'blockquote' => ['style' => []],
        'img' => ['src' => [], 'alt' => [], 'style' => []],
        'h1' => ['style' => []],
        'h2' => ['style' => []],
        'h3' => ['style' => []],
        'h4' => ['style' => []],
        'h5' => ['style' => []],
        'h6' => ['style' => []],
        'div' => ['style' => []],
        'span' => ['style' => []],
        'font' => ['style' => []], // Include <font> for legacy styles
    ];

    // Sanitize content to preserve allowed tags and styles
    return wp_kses($value, $allowed_tags);
}
add_filter('acf/update_value/type=wysiwyg', 'preserve_acf_wysiwyg_content', 10, 3);

// Include ACF WYSIWYG content in the REST API response
function add_acf_to_rest_api($data, $post, $context)
{
    $fields = get_fields($post->ID);
    if ($fields) {
        $data->data['acf'] = $fields;
    }
    return $data;
}
add_filter('rest_prepare_post', 'add_acf_to_rest_api', 10, 3);

// Add support for REST API in custom post types (if applicable)
add_action('init', function () {
    global $wp_post_types;
    if (isset($wp_post_types['custom_post_type'])) {
        $wp_post_types['custom_post_type']->show_in_rest = true;
    }
});

//till here

// Purge WP Engine cache whenever a post is saved
function purge_wpe_cache()
{
    $url = 'https://api.wpengineapi.com/v1/sites/mautskebeli/purge_cache';
    $response = wp_remote_post($url, [
        'headers' => [
            'Authorization' => 'Bearer YbWhEE58jfjBEXt3ewlefe1xtDezHO4U',
            'Content-Type' => 'application/json'
        ]
    ]);

    if (is_wp_error($response)) {
        error_log('Error purging cache: ' . $response->get_error_message());
    } else {
        error_log('Cache purge response: ' . wp_remote_retrieve_body($response));
    }
}
add_action('save_post', 'purge_wpe_cache');

add_filter('jpeg_quality', function ($arg) {
    return 100; // Set JPEG quality to 100%
});

function add_custom_post_type_switcher_meta_box()
{
    $post_types = ['mecniereba', 'sporti-videos', 'ekonomika', 'medicina', 'msoflio', 'resursebi', 'saxli', 'kalaki', 'shroma', 'xelovneba', 'sport-article', 'targmani', 'mau-books', 'article', 'free-column'];
    foreach ($post_types as $post_type) {
        add_meta_box(
            'custom_post_type_switcher_id',
            'Custom Post Type Switcher',
            'custom_post_type_switcher_callback',
            $post_type,
            'side',
            'default'
        );
    }
}
add_action('add_meta_boxes', 'add_custom_post_type_switcher_meta_box');


function disable_rest_cache($response)
{
    $headers = $response->get_headers();
    $headers['Cache-Control'] = 'no-cache, must-revalidate, max-age=0';
    $response->set_headers($headers);
    return $response;
}
add_filter('rest_post_dispatch', 'disable_rest_cache', 10, 1);


function custom_post_type_switcher_callback($post)
{
    // Define groups of related post types
    $video_group = ['mecniereba', 'sporti-videos', 'ekonomika', 'medicina', 'msoflio', 'resursebi', 'saxli', 'kalaki', 'shroma', 'xelovneba'];
    $text_group = ['sport-article', 'targmani', 'mau-books', 'article', 'free-column'];

    // Determine which group the current post type is in
    $current_group = in_array($post->post_type, $video_group) ? $video_group : (in_array($post->post_type, $text_group) ? $text_group : []);

    echo '<select name="custom_post_type_switcher" id="custom_post_type_switcher">';
    foreach ($current_group as $type) {
        echo '<option value="' . esc_attr($type) . '"' . selected($type, $post->post_type, false) . '>' . get_post_type_object($type)->labels->singular_name . '</option>';
    }
    echo '</select>';
    // Add a nonce field for security
    wp_nonce_field('custom_post_type_switch_nonce_action', 'custom_post_type_switch_nonce');
}

function handle_post_type_switch_save($post_id)
{
    if (!isset($_POST['custom_post_type_switch_nonce']) || !wp_verify_nonce($_POST['custom_post_type_switch_nonce'], 'custom_post_type_switch_nonce_action')) {
        return $post_id;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)
        return $post_id;

    if (isset($_POST['custom_post_type_switcher'])) {
        $new_post_type = sanitize_text_field($_POST['custom_post_type_switcher']);
        $current_post_type = get_post_type($post_id);

        // Define groups of related post types
        $video_group = ['mecniereba', 'sporti-videos', 'ekonomika', 'medicina', 'msoflio', 'resursebi', 'saxli', 'kalaki', 'shroma', 'xelovneba'];
        $text_group = ['sport-article', 'targmani', 'mau-books', 'article', 'free-column'];

        // Check if the new post type is in the same group as the current post type
        $current_group = in_array($current_post_type, $video_group) ? $video_group : (in_array($current_post_type, $text_group) ? $text_group : []);
        if (in_array($new_post_type, $current_group)) {
            // Check the user's permissions
            if (current_user_can('edit_post', $post_id)) {
                set_post_type($post_id, $new_post_type);
            }
        }
    }
}
add_action('save_post', 'handle_post_type_switch_save');


function register_custom_dashboard_widget()
{
    wp_add_dashboard_widget(
        'custom_latest_posts_widget',         // Widget slug.
        'Latest Posts from All Types',        // Title.
        'display_custom_latest_posts_widget'  // Display function.
    );
}
add_action('wp_dashboard_setup', 'register_custom_dashboard_widget');

function display_custom_latest_posts_widget()
{
    $args = array(
        'post_type' => ['post', 'page', 'mecniereba', 'sporti-videos', 'ekonomika', 'medicina', 'msoflio', 'resursebi', 'saxli', 'shroma', 'xelovneba', 'sport-article', 'targmani', 'mau-books', 'article', 'free-column'], // Add all desired post types
        'posts_per_page' => 10,
        'orderby' => 'modified',
        'order' => 'DESC'
    );

    $query = new WP_Query($args);

    if ($query->have_posts()) {
        echo '<ul>';
        while ($query->have_posts()) {
            $query->the_post();
            echo '<li><a href="' . get_edit_post_link() . '">' . get_the_title() . '</a> - Last Modified: ' . get_the_modified_date() . '</li>';
        }
        echo '</ul>';
    } else {
        echo '<p>No recent posts available.</p>';
    }

    wp_reset_postdata();
}



//facebook og meta tags
function custom_facebook_open_graph_tags()
{
    if (is_singular(['post', 'article', 'free-column', 'targmani'])) {
        global $post;

        // Fetch post data
        $post_title = get_the_title($post->ID);
        $post_description = has_excerpt($post->ID)
            ? get_the_excerpt($post->ID)
            : wp_trim_words(strip_shortcodes(strip_tags($post->post_content)), 30);
        $post_url = get_permalink($post->ID);

        // Fetch ACF image for targmani and free-column
        $post_image = get_the_post_thumbnail_url($post->ID, 'full');

        // Handle specific cases for targmani
        if (get_post_type($post->ID) === 'targmani') {
            $acf_fields = get_fields($post->ID);
            if (isset($acf_fields['image'])) {
                $post_image = is_numeric($acf_fields['image'])
                    ? wp_get_attachment_url($acf_fields['image'])
                    : $acf_fields['image'];

                // Ensure image is a valid URL or use fallback
                if (!filter_var($post_image, FILTER_VALIDATE_URL)) {
                    $post_image = get_template_directory_uri() . '/images/default-og-image.jpg';
                }
            }
        }

        // Handle specific cases for free-column
        if (get_post_type($post->ID) === 'free-column') {
            $acf_fields = get_fields($post->ID);
            if (isset($acf_fields['image'])) {
                $post_image = is_numeric($acf_fields['image'])
                    ? wp_get_attachment_url($acf_fields['image'])
                    : $acf_fields['image'];
            }
        }

        // Fallback to default image if no valid image is found
        if (!$post_image) {
            $post_image = get_template_directory_uri() . '/images/default-og-image.jpg';
        }

        // Output Open Graph meta tags
        echo '<meta property="og:title" content="' . esc_attr($post_title) . '" />' . "\n";
        echo '<meta property="og:description" content="' . esc_attr($post_description) . '" />' . "\n";
        echo '<meta property="og:url" content="' . esc_url($post_url) . '" />' . "\n";
        echo '<meta property="og:image" content="' . esc_url($post_image) . '" />' . "\n";
        echo '<meta property="og:image:width" content="1200" />' . "\n";
        echo '<meta property="og:image:height" content="630" />' . "\n";
        echo '<meta property="og:type" content="article" />' . "\n";
        echo '<meta property="fb:app_id" content="480323335835739" />' . "\n"; // Replace with your Facebook App ID
    }
}
add_action('wp_head', 'custom_facebook_open_graph_tags');



function add_fb_cache_buster($url)
{
    return $url . '?fb-cache-bust=' . time(); // Appends a timestamp to force Facebook to re-scrape
}
add_filter('wp_get_attachment_url', 'add_fb_cache_buster');


/**
 * Atomically set payment_status + timestamp meta, and log the transition.
 */
function msb_set_payment_status($order_id, $new_status)
{
    $old = get_post_meta($order_id, 'payment_status', true) ?: 'none';
    update_post_meta($order_id, 'payment_status', $new_status);
    update_post_meta($order_id, 'payment_status_updated_at', current_time('mysql'));

    error_log(sprintf(
        '[Don-%d] payment_status: %s → %s at %s',
        $order_id,
        $old,
        $new_status,
        current_time('mysql')
    ));
}





// Updated send_email function without automatic cancellation link
function send_email($to, $subject, $message)
{
    $headers = array(
        'Content-Type: text/html; charset=UTF-8',
        'From: Mautskebeli.ge <noreply@mautskebeli.ge>',
        'Reply-To: noreply@mautskebeli.ge',
    );

    // Log email details
    error_log('Attempting to send email to: ' . $to);
    error_log('Email subject: ' . $subject);

    // Send the email
    $sent = wp_mail($to, $subject, $message, $headers);

    // Log the result
    if ($sent) {
        error_log('Email successfully sent to ' . $to);
    } else {
        error_log('Failed to send email to ' . $to);
    }
}




//        // Disable WooCommerce emails for donation orders
//        function disable_woocommerce_emails_for_donations( $enabled, $email ) {
//            // Get the email ID
//            $email_id = $email->id;
//            
//            // Get the order object from the email
//            $order = $email->object;
//            
//            if ( is_a( $order, 'WC_Order' ) ) {
//                // Check if the order is marked as a donation
//                $is_donation = get_post_meta( $order->get_id(), 'is_donation', true );
//                
//                if ( $is_donation ) {
//                    // List of WooCommerce email IDs to disable
//                    $donation_email_ids = [
//                    'new_order',
//                    'cancelled_order',
//                    'failed_order',
//                    'customer_on_hold_order',
//                    'customer_processing_order',
//                    'customer_completed_order',
//                    'customer_refunded_order',
//                    'customer_invoice',
//                    'customer_note',
//                    // Add other email IDs as needed
//                    ];
//                    
//                    if ( in_array( $email_id, $donation_email_ids ) ) {
//                        return false; // Disable this email
//                    }
//                }
//            }
//            
//            return $enabled;
//        }
//        add_filter( 'woocommerce_email_enabled', 'disable_woocommerce_emails_for_donations', 10, 2 );
//        
//        
//        // Apply the disable function to various WooCommerce email types
//        add_filter('woocommerce_email_enabled_new_order', 'disable_woocommerce_emails_for_donations', 10, 3);
//        add_filter('woocommerce_email_enabled_customer_processing_order', 'disable_woocommerce_emails_for_donations', 10, 3);
//        add_filter('woocommerce_email_enabled_customer_completed_order', 'disable_woocommerce_emails_for_donations', 10, 3);
//        add_filter('woocommerce_email_enabled_customer_invoice', 'disable_woocommerce_emails_for_donations', 10, 3);
//        add_filter('woocommerce_email_enabled_customer_refunded_order', 'disable_woocommerce_emails_for_donations', 10, 3);
//        add_filter('woocommerce_email_enabled_customer_note', 'disable_woocommerce_emails_for_donations', 10, 3);
//        
//        








// Handle donation request
function handle_donation($request)
{
    error_log('handle_donation called');
    $data = $request->get_json_params();
    error_log('Data received: ' . print_r($data, true));

    // Check required fields
    if (!isset($data['donationAmount'], $data['donorName'], $data['donorEmail'])) {
        error_log('Missing required fields');
        return new WP_REST_Response(['status' => 'error', 'message' => 'Missing required fields'], 400);
    }

    // Create the donation post first and generate orderId
    $post_id = create_donation_post($data, 'Pending');

    // **Set the donation as a WooCommerce order and mark it as a donation**
    // This ensures WooCommerce doesn't send its own emails
    update_post_meta($post_id, 'is_donation', true);

    // Check if the donation is recurring
    if (isset($data['isRecurring']) && $data['isRecurring'] === true) {
        // Delegate recurring payment to a dedicated function
        return handle_recurring_donation($data, $post_id);
    } else {
        // Handle one-time payment process
        $payment_result = process_payment($data['donationAmount'], $data['donorName'], $data['donorEmail'], $post_id, false);

        if ($payment_result['status'] === 'success') {
            if ($payment_result['paymentUrl']) {
                // Do not send email yet; email will be sent after payment confirmation
                return new WP_REST_Response([
                    'status' => 'success',
                    'message' => $payment_result['message'],
                    'paymentUrl' => $payment_result['paymentUrl']
                ], 200);
            } else {


                return new WP_REST_Response([
                    'status' => 'success',
                    'message' => $payment_result['message']
                ], 200);
            }
        } else {
            error_log('Donation Failed: ' . $payment_result['message']);
            return new WP_REST_Response(['status' => 'error', 'message' => $payment_result['message']], 400);
        }
    }
}


// Updated generate_cancellation_link function
function generate_cancellation_link($recId)
{
    if (empty($recId)) {
        return '';                       // nothing to cancel
    }
    $frontend_cancel_url = 'https://www.mautskebeli.ge/cancel-donation';
    return $frontend_cancel_url . '?recId=' . rawurlencode($recId);
}



// Handle recurring donation
function handle_recurring_donation($data, $orderId)
{
    $access_token = get_tbc_access_token();
    if (!$access_token) {
        return new WP_REST_Response(['status' => 'error', 'message' => 'Failed to obtain access token'], 401);
    }

    // Set up payment details for recurring donation
    $payment_details = [
        'amount' => [
            'total' => floatval($data['donationAmount']),
            'currency' => 'GEL'
        ],
        'customerEmail' => $data['donorEmail'],
        'description' => 'Setup recurring donation',
        'saveCard' => true,  // Ensure card is saved
        'methods' => [5],
        'returnUrl' => 'https://www.mautskebeli.ge/donation?orderId=' . $orderId,
        'callbackUrl' => 'https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/tbc-ipn',
    ];

    // Call TBC Bank API to save card for recurring payments
    $response = wp_remote_post('https://api.tbcbank.ge/v1/tpay/payments', [
        'method' => 'POST',
        'headers' => [
            'Authorization' => 'Bearer ' . $access_token,
            'Content-Type' => 'application/json',
            'apikey' => TBC_API_KEY,
        ],
        'body' => json_encode($payment_details)
    ]);

    // Handle API response
    $response_body = json_decode(wp_remote_retrieve_body($response), true);
    error_log('Recurring donation API response: ' . print_r($response_body, true));

    if (isset($response_body['payId']) && isset($response_body['links'])) {
        // Save transaction_id (payId) to post meta
        update_post_meta($orderId, 'transaction_id', sanitize_text_field($response_body['payId']));

        // Set payment status to 'Pending'
        update_post_meta($orderId, 'payment_status', 'Pending');

        // Get approval URL
        $approvalUrl = '';
        foreach ($response_body['links'] as $link) {
            if ($link['rel'] === 'approval_url' || $link['rel'] === 'approve') {
                $approvalUrl = $link['uri'];
                break;
            }
        }

        if (!$approvalUrl) {
            // Handle error, approval URL not found
            return new WP_REST_Response([
                'status' => 'error',
                'message' => 'Approval URL not found in response'
            ], 400);
        }

        return new WP_REST_Response([
            'status' => 'success',
            'message' => 'Recurring setup initiated. Awaiting payment confirmation.',
            'paymentUrl' => $approvalUrl
        ], 200);
    } else {
        // Handle failure scenario
        // Update payment status to 'Failed'
        msb_set_payment_status($orderId, 'Failed');

        // **Check if failure email has already been sent**
        $email_sent = get_post_meta($orderId, 'email_sent', true);
        if (!$email_sent) {
            // Send a failure notification email to the donor
            $subject = "ყოველთვიური დონაცია - გადახდა ვერ მოხერხდა";
            $message = "ძვირფასო " . esc_html($data['donorName']) . ",<br><br>";
            $message .= "გადახდა ვერ მოხერხდა, გთხოვთ თავიდან სცადოთ<br><br>";
            $message .= "პატივისცემით,<br>Mautskebeli.ge ";

            send_email($data['donorEmail'], $subject, $message);

            // **Mark email as sent**
            update_post_meta($orderId, 'email_sent', 1);
            error_log('Failure email sent and marked as sent for orderId: ' . $orderId);
        } else {
            error_log('Failure email has already been sent for orderId: ' . $orderId);
        }

        return new WP_REST_Response([
            'status' => 'error',
            'message' => 'Recurring setup failed. Please try again.'
        ], 400);
    }
}



// Save recurring payment info using orderId
function save_recurring_payment_info($orderId, $recId)
{
    error_log('save_recurring_payment_info called with orderId: ' . $orderId . ' and recId: ' . $recId);

    // Retrieve donorEmail and donationAmount from post meta
    $donorEmail = get_post_meta($orderId, 'email', true);
    $donationAmount = get_post_meta($orderId, 'amount', true);

    error_log('Retrieved donorEmail: ' . $donorEmail . ' and donationAmount: ' . $donationAmount);

    // Update ACF fields instead of saving in a custom table
    // Use the ACF field names you provided earlier

    update_field('email', sanitize_email($donorEmail), $orderId); // Update 'email' field
    update_field('recid', sanitize_text_field($recId), $orderId); // Update 'recId' field
    update_field('amount', floatval($donationAmount), $orderId); // Update 'amount' field

    error_log('Recurring payment info saved in ACF fields for orderId: ' . $orderId);

    // Optionally, you can still save the recId in the post meta (as backup if needed)
    update_post_meta($orderId, 'recId', $recId);
    error_log('recId saved in post meta for orderId: ' . $orderId);
}



// Generate the email content for the thank you email
function generate_thank_you_email_content($donor_name, $amount, $next_payment_date, $cancel_link)
{

    $message = 'ძვირფასო ' . esc_html($donor_name) . ',<br><br>';
    $message .= 'მადლობას გიხდით მხარდაჭერისთვის! ყოველთვიური დონაციის თანხა – '
        . esc_html($amount) . ' GEL.<br>';
    $message .= 'მომდევნო გადახდის თარიღი – '
        . date('Y-m-d', strtotime($next_payment_date)) . '.<br>';

    /* add link only if we actually have one */
    if ($cancel_link) {
        $message .= "გასაუქმებლად გადადით <a href='" .
            esc_url($cancel_link) . "'>ბმულზე</a><br><br>";
    }


    $message .= '<br>პატივისცემით,<br>Mautskebeli.ge';

    return $message;
}



// Charge recurring payment without email logic
function charge_recurring_payment($recId, $amount)
{
    $access_token = get_tbc_access_token();

    $payment_details = [
        'money' => [
            'currency' => 'GEL',
            'amount' => floatval($amount)
        ],
        'recId' => $recId,
        'initiator' => 'merchant', // Explicitly set initiator
        'preAuth' => false // Set according to your needs
    ];

    // Call TBC Bank API to charge saved card
    $response = wp_remote_post('https://api.tbcbank.ge/v1/tpay/payments/execution', [
        'method' => 'POST',
        'headers' => [
            'Authorization' => 'Bearer ' . $access_token,
            'Content-Type' => 'application/json',
            'apikey' => TBC_API_KEY,
        ],
        'body' => json_encode($payment_details)
    ]);

    $response_body = json_decode(wp_remote_retrieve_body($response), true);

    if (isset($response_body['status']) && $response_body['status'] === 'Succeeded') {
        $payId = $response_body['payId'];
        update_donation_post_with_new_transaction_id($recId, $payId);

        // Fetch the user details for the recurring payment
        $donation_post_id = get_donation_post_id_by_recId($recId);
        if ($donation_post_id) {
            // NOTE: next_payment_date is now handled by the cron (process_daily_recurring_payments)
            // which creates a new post for each charge. Don't update it here to avoid conflicts.

            // mark this instalment as successful and clear strikes
            msb_set_payment_status($donation_post_id, 'Succeeded');
            update_post_meta($donation_post_id, 'retry_count', 0);

            // Log that the recurring payment was successful
            error_log("Recurring payment processed successfully for recId: $recId");
        }

        return true;
    } else {
        error_log('Failed to process recurring payment: ' . print_r($response_body, true));
        return false;
    }
}



/**
 * Send a "Thank You" email each time a recurring payment succeeds (beyond the first).
 * Called right after we charge the donor in process_daily_recurring_payments().
 */
function send_monthly_success_email($donation_post_id)
{
    // Fetch donor info from post meta
    $donor_email = get_post_meta($donation_post_id, 'email', true);
    $donor_name = get_post_meta($donation_post_id, 'name', true);
    $amount = get_post_meta($donation_post_id, 'amount', true);
    $next_date = get_post_meta($donation_post_id, 'next_payment_date', true);
    $recId = get_post_meta($donation_post_id, 'recId', true);

    // Generate cancellation link
    $cancel_link = generate_cancellation_link($recId);

    // Compose the email
    $subject = "ყოველთვიური დონაცია - მადლობას გიხდით მხარდაჭერისთვის!";
    $message = "თქვენი ყოველთვიური კონტრიბუცია აძლიერებს პლათფორმას.<br>";
    $message .= "თანხა: <strong>" . esc_html($amount) . " GEL</strong>.<br>";
    $message .= "მომდევნო გადახდის თარიღი: <strong>" . date('Y-m-d', strtotime($next_date)) . "</strong>.<br><br>";
    if ($cancel_link) {
        $message .= "გასაუქმებლად გადადით <a href='" .
            esc_url($cancel_link) . "'>ბმულზე</a><br><br>";
    }

    $message .= "პატივისცემით,<br>Mautskebeli.ge";

    // Send the email
    send_email($donor_email, $subject, $message);
}



/**
 * Send a "Payment Failed" email each time a monthly charge fails (except the 3rd fail).
 * Called in process_daily_recurring_payments() if $success === false AND retry_count < 3.
 *
 * @param int    $donation_post_id  The ID of the donation post
 * @param string $next_retry_date   (YYYYMMDD) The next date we will attempt a charge
 */
function send_recurring_payment_failed_email($donation_post_id, $next_retry_date = null)
{
    // Fetch donor info
    $donor_email = get_post_meta($donation_post_id, 'email', true);
    $donor_name = get_post_meta($donation_post_id, 'name', true);
    $amount = get_post_meta($donation_post_id, 'amount', true);
    $recId = get_post_meta($donation_post_id, 'recId', true);

    // Compose the subject & body
    $subject = "ყოველთვიური დონაცია - გადახდა ვერ მოხერხდა";
    $message = "ძვირფასო " . esc_html($donor_name) . ",<br><br>";
    $message .= "გადახდა ვერ მოხერხდა.<br>";
    $message .= "თანხა: <strong>" . esc_html($amount) . " GEL</strong>.<br><br>";

    // If we passed a $next_retry_date, mention that we will retry again
    if ($next_retry_date) {
        // Convert YYYYMMDD to a nicer format, e.g. 2025-03-03
        $readable_date = date('Y-m-d', strtotime($next_retry_date));
        $message .= "გადახდის მომდევნო მცდელობა: <strong>" . $readable_date . "</strong>-ში.<br><br>";
    }

    // Provide a cancellation link if they prefer to stop
    $cancel_link = generate_cancellation_link($recId);
    if ($cancel_link) {
        $message .= "გასაუქმებლად გადადით <a href='" .
            esc_url($cancel_link) . "'>ბმულზე</a><br><br>";
    }

    $message .= "პატივისცემით,<br>Mautskebeli.ge";

    // Send the email
    send_email($donor_email, $subject, $message);
}



/**
 * Send a "Cancellation Confirmation" email each time a donor cancels a recurring donation.
 * (We no longer do auto-cancel after 3 failures, so no mention of multiple fails.)
 */
function send_cancellation_email($donation_post_id)
{
    // Optional: check if we've already sent a cancel email, to avoid duplicates
    $already_sent = get_post_meta($donation_post_id, 'cancel_email_sent', true);
    if ($already_sent) {
        error_log("Cancellation email already sent for donation_post_id: $donation_post_id");
        return; // do nothing
    }

    // Gather donor info
    $donor_email = get_post_meta($donation_post_id, 'email', true);
    $donor_name = get_post_meta($donation_post_id, 'name', true);
    $amount = get_post_meta($donation_post_id, 'amount', true);

    // Compose the subject & body
    $subject = "ყოველთვიური დონაცია გაუქმდა";

    // Standard cancellation text (no reference to multiple failures)
    $message = "ძვირფასო დონორო,<br><br>";
    $message .= "ყოველთვიური დონაცია გაუქმებულია.<br>";
    $message .= "გმადლობთ თანადგომისთვის!<br><br>";
    $message .= "პატივისცემით,<br>Mautskebeli.ge";

    // Send the email
    send_email($donor_email, $subject, $message);

    // Mark that we've sent it (optional)
    update_post_meta($donation_post_id, 'cancel_email_sent', 1);
    error_log("Cancellation email sent and marked as sent for donation_post_id: $donation_post_id");
}



// Update donation post with new transaction ID for each recurring payment
function update_donation_post_with_new_transaction_id($recId, $payId)
{
    // Get the donation post ID associated with this recId
    $donation_post_id = get_donation_post_id_by_recId($recId);

    if ($donation_post_id) {
        // Update the donation post with the new transaction ID using update_post_meta
        update_post_meta($donation_post_id, 'transaction_id', sanitize_text_field($payId));
    }
}



// Schedule monthly recurring payments
//        function activate_monthly_recurring_payments() {
//            if (!wp_next_scheduled('monthly_recurring_payment_event')) {
//                wp_schedule_event(time(), 'monthly', 'monthly_recurring_payment_event');
//            }
//        }
//        add_action('wp', 'activate_monthly_recurring_payments');
//        
//        add_action('monthly_recurring_payment_event', 'process_monthly_recurring_payments');

/**
 * Processes all recurring donations that are due today.
 * 
 * HARDENED VERSION - Prevents double-charging with:
 * 1. Emergency stop check (MSB_RECURRING_DISABLED)
 * 2. Dry-run mode support (MSB_RECURRING_DRY_RUN)
 * 3. Per-recId deduplication (only ONE post per recId processed)
 * 4. Detailed logging for debugging
 * 5. Last charge date tracking for auditing
 * 
 * - If charge succeeds: next_payment_date => +1 month
 * - If charge fails: increment retry_count, schedule retry in 14 days
 * - After 4 failures: cancel the subscription
 */
function process_daily_recurring_payments()
{
    // ============================================================================
    // CRON IS NOW ENABLED - All safeguards are in place:
    // 1. Deduplication by recId (only one post per recId processed)
    // 2. Last charge date check (25+ days required)
    // 3. Transient lock (prevents double-charging in same billing period)
    // 4. Race condition protection (clears next_payment_date immediately)
    // ============================================================================

    // ========== EMERGENCY STOP CHECK ==========
    if (defined('MSB_RECURRING_DISABLED') && MSB_RECURRING_DISABLED) {
        error_log('[RECURRING] EMERGENCY STOP: MSB_RECURRING_DISABLED is true. No charges will be processed.');
        return;
    }

    // ========== DRY RUN MODE CHECK ==========
    $dry_run = defined('MSB_RECURRING_DRY_RUN') && MSB_RECURRING_DRY_RUN;
    if ($dry_run) {
        error_log('[RECURRING] *** DRY RUN MODE ENABLED - No actual charges will be made ***');
    }

    error_log('[RECURRING] daily_recurring fired at ' . current_time('mysql'));

    // 1. Get all active recurring donations (with valid next_payment_date)
    $recurring_users = get_users_with_recurring_donations();
    
    error_log('[RECURRING] Found ' . count($recurring_users) . ' candidate posts with valid next_payment_date');

    // ========== CRITICAL FIX: DEDUPLICATE BY recId ==========
    // Build an associative array keyed by recId.
    // Since the query orders by ID DESC (newest first), the first occurrence
    // of each recId is the newest post for that subscription.
    // This GUARANTEES only ONE charge per recId per cron run.
    $unique_by_recId = array();
    $skipped_duplicates = 0;

    foreach ($recurring_users as $user) {
        $recId = $user['recId'];
        
        if (!isset($unique_by_recId[$recId])) {
            // First (newest) occurrence of this recId - keep it
            $unique_by_recId[$recId] = $user;
        } else {
            // Duplicate recId - skip it to prevent double-charging
            $skipped_duplicates++;
            error_log(sprintf(
                '[RECURRING] DEDUP: Skipping post ID %d for recId %s (already have post ID %d)',
                $user['donationPostId'],
                $recId,
                $unique_by_recId[$recId]['donationPostId']
            ));
        }
    }
    
    error_log(sprintf(
        '[RECURRING] After deduplication: %d unique recIds (%d duplicates skipped)',
        count($unique_by_recId),
        $skipped_duplicates
    ));
    // ========================================================

    // Get today's date in YYYYMMDD format
    $today = current_time('Ymd');
    $today_timestamp = current_time('timestamp');
    $processed_count = 0;
    $due_count = 0;
    $skipped_already_charged = 0;

    // 2. Process each unique recId (GUARANTEED one per subscription)
    foreach ($unique_by_recId as $recId => $user) {
        $amount            = $user['donationAmount'];
        $donation_post_id  = $user['donationPostId'];
        $donor_email       = $user['donorEmail'];
        $donor_name        = $user['donorName']; // ← FIXED: Now properly fetched

        // Get and normalize the next payment date
        $raw_date = get_post_meta($donation_post_id, 'next_payment_date', true);
        $next_payment_date = normalize_date_to_ymd($raw_date);

        // Safety check: ensure we have a valid date
        if (empty($next_payment_date) || strlen($next_payment_date) !== 8) {
            error_log(sprintf(
                '[RECURRING] SKIP: Post ID %d has invalid next_payment_date: "%s"',
                $donation_post_id,
                $raw_date
            ));
            continue;
        }

        // 3. Check if payment is due today
        if ($next_payment_date === $today) {
            $due_count++;
            
            error_log(sprintf(
                '[RECURRING] DUE TODAY: Post ID %d, recId %s, name %s, email %s, amount %s GEL',
                $donation_post_id,
                $recId,
                $donor_name,
                $donor_email,
                $amount
            ));

            // ========== NEW SAFEGUARD: Check last_charge_date ==========
            // Prevent charging if this recId was already charged in the last 25 days
            $last_charge_date = get_post_meta($donation_post_id, 'last_charge_date', true);
            if (!empty($last_charge_date)) {
                $last_charge_timestamp = strtotime($last_charge_date);
                $days_since_last_charge = floor(($today_timestamp - $last_charge_timestamp) / DAY_IN_SECONDS);
                
                if ($days_since_last_charge < 25) {
                    $skipped_already_charged++;
                    error_log(sprintf(
                        '[RECURRING] BLOCKED: recId %s was charged %d days ago (on %s). Min 25 days required. Skipping.',
                        $recId,
                        $days_since_last_charge,
                        $last_charge_date
                    ));
                    continue;
                }
            }
            // ============================================================

            // ========== DRY RUN: Log only, don't charge ==========
            if ($dry_run) {
                error_log(sprintf(
                    '[RECURRING] [DRY RUN] WOULD CHARGE: Post ID %d, recId %s, email %s, amount %s GEL',
                    $donation_post_id,
                    $recId,
                    $donor_email,
                    $amount
                ));
                continue;  // Skip actual charging in dry run mode
            }
            // =====================================================

            // ========== RACE CONDITION PROTECTION ==========
            // IMMEDIATELY clear next_payment_date so this post can't be picked up again
            // This prevents double-charging if cron runs twice
            $saved_next_payment_date = $next_payment_date; // Save for potential restore on failure
            delete_post_meta($donation_post_id, 'next_payment_date');
            error_log("[RECURRING] LOCKED: Cleared next_payment_date from post ID $donation_post_id");
            
            // Transient lock: include year-month to prevent charging same recId twice in same billing period
            $billing_period = date('Ym', $today_timestamp); // e.g., "202512"
            $lock_key = 'msb_charged_' . $billing_period . '_' . $recId;
            
            if (get_transient($lock_key)) {
                error_log("[RECURRING] BLOCKED: recId $recId was already charged in billing period $billing_period (transient lock). Skipping.");
                // Restore next_payment_date for next month
                $next_month = date('Ymd', strtotime('+1 month', $today_timestamp));
                update_post_meta($donation_post_id, 'next_payment_date', $next_month);
                $skipped_already_charged++;
                continue;
            }
            
            // Set lock BEFORE charging (expires in 35 days - covers the billing period)
            set_transient($lock_key, time(), 35 * DAY_IN_SECONDS);
            error_log("[RECURRING] SET LOCK: $lock_key for 35 days");
            // ================================================

            // 4. Attempt to charge the donor
            $success = charge_recurring_payment($recId, $amount);

            if ($success) {
                // ========== SUCCESS BRANCH ==========
                $processed_count++;
                error_log("[RECURRING] SUCCESS: Charged recId $recId for $amount GEL");

                // Get the transaction_id that was set by charge_recurring_payment()
                $new_transaction_id = get_post_meta($donation_post_id, 'transaction_id', true);
                
                // Calculate next payment date (+1 month from today)
                $new_next_payment_date = date('Ymd', strtotime("+1 month", $today_timestamp));
                
                // ========== UPDATE EXISTING POST (NO NEW POST CREATION) ==========
                // This prevents database clutter and ensures one post per recId
                // Dashboard can track monthly charges via transaction_id history or last_charge_date
                
                // Update next_payment_date on the EXISTING post
                update_post_meta($donation_post_id, 'next_payment_date', $new_next_payment_date);
                
                // Update last charge tracking
                update_post_meta($donation_post_id, 'last_charge_date', date('Y-m-d', $today_timestamp));
                update_post_meta($donation_post_id, 'last_charge_timestamp', current_time('mysql'));
                
                // Update payment status to Succeeded (in case it was Failed from retry)
                msb_set_payment_status($donation_post_id, 'Succeeded');
                
                // Reset retry count on success
                update_post_meta($donation_post_id, 'retry_count', 0);
                
                error_log("[RECURRING] Updated post ID $donation_post_id for recId $recId");
                error_log("[RECURRING] New next_payment_date: $new_next_payment_date");
                error_log("[RECURRING] Transaction ID: $new_transaction_id");

                // Send the "monthly success" email using the EXISTING post
                send_monthly_success_email($donation_post_id);

            } else {
                // ========== FAILURE BRANCH ==========
                error_log("[RECURRING] FAILED: Could not charge recId $recId");

                // Clear the billing period lock since charge failed
                delete_transient($lock_key);
                error_log("[RECURRING] Cleared lock $lock_key due to failed charge");

                // 1) Increment strike count and mark as "Failed"
                $retry = (int) get_post_meta($donation_post_id, 'retry_count', true) + 1;
                update_post_meta($donation_post_id, 'retry_count', $retry);
                msb_set_payment_status($donation_post_id, 'Failed');

                // 2) If this is the 4th (or more) failure, cancel permanently
                if ($retry >= 4) {
                    update_post_meta($donation_post_id, 'payment_status', 'Cancelled');
                    // Leave next_payment_date cleared - this subscription is cancelled
                    error_log("[RECURRING] CANCELLED: recId $recId after $retry failures");
                    send_cancellation_email($donation_post_id);
                    continue;  // stop any further retries
                }

                // 3) Otherwise schedule the next retry in 14 days on the SAME post
                $next = date('Ymd', strtotime('+14 days', $today_timestamp));
                update_post_meta($donation_post_id, 'next_payment_date', $next);

                error_log("[RECURRING] Scheduled retry for recId $recId on $next (attempt $retry/4)");

                // 4) Notify donor that we'll retry again
                send_recurring_payment_failed_email($donation_post_id, $next);
            }

        } else {
            // Not due today - only log in verbose mode to reduce log spam
            // error_log("[RECURRING] NOT DUE: Post ID $donation_post_id, next_payment_date: $next_payment_date, today: $today");
        }
    }

    error_log(sprintf(
        '[RECURRING] Completed: %d due today, %d charged, %d skipped (already charged this period)%s',
        $due_count,
        $processed_count,
        $skipped_already_charged,
        $dry_run ? ' (DRY RUN - no actual charges)' : ''
    ));
}



// Schedule daily recurring payments and reminders
function activate_recurring_cron_events()
{
    if (!wp_next_scheduled('daily_recurring_payment_event')) {
        wp_schedule_event(time(), 'daily', 'daily_recurring_payment_event');
    }
    if (!wp_next_scheduled('daily_recurring_payment_reminder_event')) {
        wp_schedule_event(time(), 'daily', 'daily_recurring_payment_reminder_event');
    }
}


add_action('init', 'activate_recurring_cron_events');


// Clear cron events on plugin deactivation
function deactivate_recurring_cron_events()
{
    wp_clear_scheduled_hook('daily_recurring_payment_event');
    wp_clear_scheduled_hook('daily_recurring_payment_reminder_event');
}


// Hook the daily recurring payment processing
add_action('daily_recurring_payment_event', 'process_daily_recurring_payments');

// Hook the daily reminder emails
add_action('daily_recurring_payment_reminder_event', 'send_reminder_emails_before_payment');

// Function to send reminder emails 2 days before the next payment
/**
 * Send reminder emails 2 days before the next payment.
 * 
 * HARDENED VERSION:
 * - Uses the same deduplication logic as the payment processor
 * - Only ONE reminder per recId per day
 */
function send_reminder_emails_before_payment()
{
    $recurring_users = get_users_with_recurring_donations();

    // Deduplicate by recId (same logic as process_daily_recurring_payments)
    // This prevents sending duplicate reminders for the same subscription
    $unique_by_recId = array();
    foreach ($recurring_users as $user) {
        $recId = $user['recId'];
        if (!isset($unique_by_recId[$recId])) {
            $unique_by_recId[$recId] = $user;
        }
    }

        // Calculate "today + 2 days" in YYYYMMDD
        $today_plus_two = date('Ymd', strtotime("+2 days", current_time('timestamp')));

    foreach ($unique_by_recId as $recId => $user) {
        $raw_date = $user['next_payment_date'];
        $next_payment_date = normalize_date_to_ymd($raw_date);

        if ($next_payment_date === $today_plus_two) {
            send_recurring_payment_reminder($user);
        }
    }
}


// Updated send_recurring_payment_reminder() to ensure proper email sending
function send_recurring_payment_reminder($user)
{
    $recId = $user['recId'];
    $donor_email = $user['donorEmail'];
    $donation_amount = $user['donationAmount'];
    $donation_post_id = $user['donationPostId'];

    // Check if reminder email has already been sent
    $reminder_sent = get_post_meta($donation_post_id, 'reminder_email_sent', true);
    if ($reminder_sent) {
        error_log("Reminder email already sent for recId: $recId");
        return;
    }

    // Fetch the raw date from meta
    $raw_date = get_post_meta($donation_post_id, 'next_payment_date', true);
    // Normalize it
    $next_payment_date = normalize_date_to_ymd($raw_date);

    // Compare with "today + 2 days"
    $today_plus_two = date('Ymd', strtotime("+2 days", current_time('timestamp')));

    if ($next_payment_date === $today_plus_two) {
        $cancel_link = generate_cancellation_link($recId);
        $subject = "ყოველთვიური დონაცია - გადახდის თარიღი";
        $message = "ძვირფასო დონორო,<br><br>";
        $message .= "შეგახსენებთ, რომ თქვენი ყოველთვიური დონაციის გადახდის თარიღი ახლოვდება ("
            . date('Y-m-d', strtotime($next_payment_date)) . ").<br>";
        $message .= "თქვენი ყოველთვიური კონტრიბუცია აძლიერებს პლათფორმას.<br>";
        $message .= "დონაციის თანხა: " . esc_html($donation_amount) . " GEL.<br>";
        if ($cancel_link) {
            $message .= "გასაუქმებლად გადადით <a href='" .
                esc_url($cancel_link) . "'>ბმულზე</a><br><br>";
        }

        $message .= "პატივისცემით,<br>Mautskebeli.ge";

        send_email($donor_email, $subject, $message);

        // Mark reminder as sent
        update_post_meta($donation_post_id, 'reminder_email_sent', 1);
        error_log("Reminder email sent and marked as sent for recId: $recId");
    } else {
        error_log("No reminder sent. next_payment_date: $next_payment_date, today_plus_two: $today_plus_two (raw was: $raw_date)");
    }
}





/**
 * Get the canonical donation post ID for a given recId.
 * 
 * IMPROVED VERSION:
 * - Returns the NEWEST post that has a valid next_payment_date
 * - Falls back to newest post overall if none have valid dates
 * - More defensive against duplicates
 * 
 * @param string $recId The recurring payment ID from TBC
 * @return int|null The donation post ID, or null if not found
 */
function get_donation_post_id_by_recId($recId)
{
    if (empty($recId)) {
        return null;
    }

    // First try: Find posts with this recId that have valid next_payment_date
    $args = array(
        'post_type'      => 'donation',
        'post_status'    => 'publish',
        'posts_per_page' => 1,
        'orderby'        => 'ID',
        'order'          => 'DESC',  // Newest first
        'meta_query'     => array(
            'relation' => 'AND',
            array(
                'key'     => 'recId',
                'value'   => $recId,
                'compare' => '='
        ),
            // Prefer posts with valid next_payment_date
            array(
                'key'     => 'next_payment_date',
                'compare' => 'EXISTS'
            ),
            array(
                'key'     => 'next_payment_date',
                'value'   => '',
                'compare' => '!='
            ),
        ),
    );

    $query = new WP_Query($args);

    if ($query->have_posts()) {
        $query->the_post();
        $post_id = get_the_ID();
        wp_reset_postdata();
        return $post_id;
    }

    // Fallback: Find ANY post with this recId (newest first)
    $args_fallback = array(
        'post_type'      => 'donation',
        'post_status'    => 'publish',
        'posts_per_page' => 1,
        'orderby'        => 'ID',
        'order'          => 'DESC',
        'meta_query'     => array(
            array(
                'key'     => 'recId',
                'value'   => $recId,
                'compare' => '='
            ),
        ),
    );

    $query_fallback = new WP_Query($args_fallback);

    if ($query_fallback->have_posts()) {
        $query_fallback->the_post();
        $post_id = get_the_ID();
        wp_reset_postdata();
        error_log("[RECURRING] Warning: get_donation_post_id_by_recId used fallback for recId $recId");
        return $post_id;
    }

    return null;
}

/**
 * Retrieve users with ACTIVE recurring donations.
 * 
 * HARDENED VERSION - Critical changes:
 * 1. REQUIRES next_payment_date to exist and be non-empty
 * 2. Posts with NULL/empty next_payment_date are treated as HISTORICAL and EXCLUDED
 * 3. Returns posts ordered by ID DESC (newest first) for consistent deduplication
 * 
 * This GUARANTEES that backfilled posts with NULL next_payment_date
 * will NEVER be selected for charging.
 * 
 * @return array List of recurring donations with recId, email, amount, post ID, and next_payment_date
 */
function get_users_with_recurring_donations()
{
    $args = array(
        'post_type'      => 'donation',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'orderby'        => 'ID',
        'order'          => 'DESC',  // Newest first - critical for deduplication
        'meta_query'     => array(
            'relation' => 'AND',

            // 1) Must be a recurring payment
            array(
                'key'     => 'payment_type',
                'value'   => 'Recurring',
                'compare' => '='
            ),

            // 2) Must NOT be cancelled
            array(
                'key'     => 'payment_status',
                'value'   => 'Cancelled',
                'compare' => '!='
            ),

            // 3) recId meta must exist and not be empty
            array(
                'key'     => 'recId',
                'compare' => 'EXISTS'
            ),
            array(
                'key'     => 'recId',
                'value'   => '',
                'compare' => '!='
            ),

            // ========== CRITICAL FIX: Require valid next_payment_date ==========
            // 4) next_payment_date must exist
            array(
                'key'     => 'next_payment_date',
                'compare' => 'EXISTS'
            ),
            // 5) next_payment_date must NOT be empty string
            array(
                'key'     => 'next_payment_date',
                'value'   => '',
                'compare' => '!='
            ),

            // ========== NEW FIX: Exclude historical posts ==========
            // 6) Must NOT be marked as historical
            array(
                'relation' => 'OR',
                array(
                    'key'     => 'is_historical',
                    'compare' => 'NOT EXISTS'
                ),
                array(
                    'key'     => 'is_historical',
                    'value'   => '1',
                    'compare' => '!='
                ),
            ),

            // 7) Must NOT be a backfill post
            array(
                'relation' => 'OR',
                array(
                    'key'     => 'is_backfill',
                    'compare' => 'NOT EXISTS'
                ),
                array(
                    'key'     => 'is_backfill',
                    'value'   => '1',
                    'compare' => '!='
                ),
            ),
            // ========================================================
        ),
    );

    $query = new WP_Query($args);
    $recurring_users = array();

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $donation_post_id = get_the_ID();
            
            // Double-check next_payment_date is truly non-empty (defense in depth)
            $next_payment_date = get_post_meta($donation_post_id, 'next_payment_date', true);
            if (empty($next_payment_date)) {
                // Skip this post - it has no valid next_payment_date
                error_log("[RECURRING] Skipping post ID $donation_post_id: next_payment_date is empty despite query filter");
                continue;
            }
            
            // Double-check is_historical (defense in depth)
            $is_historical = get_post_meta($donation_post_id, 'is_historical', true);
            if ($is_historical === '1') {
                error_log("[RECURRING] Skipping post ID $donation_post_id: marked as historical");
                continue;
            }
            
            $recurring_users[] = array(
                'recId'            => get_post_meta($donation_post_id, 'recId', true),
                'donorEmail'       => get_post_meta($donation_post_id, 'email', true),
                'donorName'        => get_post_meta($donation_post_id, 'name', true), // ← Added name
                'donationAmount'   => get_post_meta($donation_post_id, 'amount', true),
                'donationPostId'   => $donation_post_id,
                'next_payment_date'=> $next_payment_date,
            );
        }
        wp_reset_postdata();
    }

    return $recurring_users;
}



// Delete a recurring payment by recId
function delete_recurring_payment($request)
{
    $params = $request->get_query_params();

    if (!isset($params['recId'])) {
        return new WP_REST_Response([
            'code' => 'missing_recId',
            'message' => 'recId is required',
            'data' => ['status' => 400]
        ], 400);
    }

    $recId = sanitize_text_field($params['recId']);
    $access_token = get_tbc_access_token();

    if (!$access_token) {
        return new WP_REST_Response([
            'status' => 'error',
            'message' => 'Failed to obtain access token'
        ], 401);
    }

    // Make the POST request to delete the recurring payment
    $response = wp_remote_post("https://api.tbcbank.ge/v1/tpay/payments/$recId/delete", [
        'headers' => [
            'Authorization' => 'Bearer ' . $access_token,
            'Content-Type' => 'application/json',
            'apikey' => TBC_API_KEY,
        ],
        'body' => '' // Send an empty body as per API documentation
    ]);

    // Check for errors in the API call
    if (is_wp_error($response)) {
        error_log('Error deleting recurring payment: ' . $response->get_error_message());
        return new WP_REST_Response([
            'status' => 'error',
            'message' => 'Failed to delete recurring payment: ' . $response->get_error_message()
        ], 500);
    }

    $response_code = wp_remote_retrieve_response_code($response);

    $response_body = wp_remote_retrieve_body($response);

    // Log the full response for debugging
    error_log("Delete Recurring Payment Response Code: $response_code");
    error_log("Delete Recurring Payment Response Body: $response_body");

    // Check if the API call was successful based on HTTP status code
    if ($response_code === 200) {
        deactivate_recurring_payment($recId);
        return new WP_REST_Response([
            'status' => 'success',
            'message' => 'Recurring payment cancelled successfully.'
        ], 200);
    } else {
        // Decode the response body to extract error details
        $response_data = json_decode($response_body, true);
        $error_message = isset($response_data['detail']) ? $response_data['detail'] : 'Failed to cancel recurring payment.';

        error_log("Failed to cancel recurring payment. recId: $recId. Error: $error_message");

        return new WP_REST_Response([
            'status' => 'error',
            'message' => $error_message
        ], $response_code);
    }
}

// Deactivate recurring payment in the database
function deactivate_recurring_payment($recId)
{
    // Get the donation post ID associated with this recId
    $donation_post_id = get_donation_post_id_by_recId($recId);

    if ($donation_post_id) {
        // Update post meta to mark the payment as cancelled
        update_post_meta($donation_post_id, 'payment_status', 'Cancelled');

        // Optionally, remove the recId if no longer needed
        // delete_post_meta($donation_post_id, 'recId');

        error_log("Recurring payment with recId: $recId has been deactivated for post ID: $donation_post_id.");

        send_cancellation_email($donation_post_id);
    } else {
        error_log("No donation post found for recId: $recId.");
    }
}



// Register REST endpoint to cancel recurring payment
function register_delete_recurring_payment_endpoint()
{
    register_rest_route('wp/v2', '/cancel-recurring-payment/', array(
        'methods' => 'GET', // Changed from POST to GET for easier access via link
        'callback' => 'delete_recurring_payment',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'register_delete_recurring_payment_endpoint');



/**
 * Manually test a single recurring donation by recId (for debugging).
 * Similar logic to process_daily_recurring_payments(), but for one record.
 */
function test_single_recurring_payment_endpoint($request)
{
    // 1. Grab the recId from the request
    $params = $request->get_query_params();
    if (empty($params['recId'])) {
        return new WP_REST_Response([
            'status' => 'error',
            'message' => 'Missing recId parameter'
        ], 400);
    }
    $recId = sanitize_text_field($params['recId']);

    // 2. Find the donation post by that recId
    $donation_post_id = get_donation_post_id_by_recId($recId);
    if (!$donation_post_id) {
        return new WP_REST_Response([
            'status' => 'error',
            'message' => 'No donation post found for recId: ' . $recId
        ], 404);
    }

    // 3. Get the donation’s next_payment_date & amount
    $raw_date = get_post_meta($donation_post_id, 'next_payment_date', true);
    $amount = get_post_meta($donation_post_id, 'amount', true);
    $today = current_time('Ymd');
    $next_date = normalize_date_to_ymd($raw_date);

    // 4. If next_payment_date != today, bail out (or remove this check if you want to force a charge anyway)
    if ($next_date !== $today) {
        return new WP_REST_Response([
            'status' => 'error',
            'message' => "Donation next_payment_date is not today ($next_date vs $today)."
        ], 200);
    }

    // 5. Attempt the charge
    $success = charge_recurring_payment($recId, $amount);

    if ($success) {
        // ===== SUCCESS BRANCH =====
        error_log("TEST: Single recurring payment succeeded for recId: $recId");

        // Move next_payment_date forward by 1 month
        $new_date = date('Ymd', strtotime("+1 month", current_time('timestamp')));
        update_post_meta($donation_post_id, 'next_payment_date', $new_date);

        // Reset flags
        delete_post_meta($donation_post_id, 'monthly_email_sent');
        delete_post_meta($donation_post_id, 'reminder_email_sent');

        // Send success email
        send_monthly_success_email($donation_post_id);

        return new WP_REST_Response([
            'status' => 'success',
            'message' => 'Payment succeeded. next_payment_date updated.'
        ], 200);

    } else {
        // ===== FAILURE BRANCH =====
        error_log("TEST: Single recurring payment failed for recId: $recId");

        // 1) Increment strike count and mark as “Failed”
        $retry = (int) get_post_meta($donation_post_id, 'retry_count', true) + 1;
        update_post_meta($donation_post_id, 'retry_count', $retry);
        update_post_meta($donation_post_id, 'payment_status', 'Failed');

        // 2) If this is the 4th (or more) failure, cancel permanently
        if ($retry >= 4) {
            update_post_meta($donation_post_id, 'payment_status', 'Cancelled');
            send_cancellation_email($donation_post_id);
            return new WP_REST_Response([
                'status' => 'error',
                'message' => "4 strikes reached — subscription cancelled."
            ], 200);
        }

        // 3) Otherwise schedule the next retry in 14 days
        $next = date('Ymd', strtotime('+14 days', current_time('timestamp')));
        update_post_meta($donation_post_id, 'next_payment_date', $next);

        // 4) Notify donor that we’ll retry again
        send_recurring_payment_failed_email($donation_post_id, $next);

        return new WP_REST_Response([
            'status' => 'error',
            'message' => 'Payment failed. Next retry on ' . $next
        ], 200);

    }
}


function register_test_single_recurring_endpoint()
{
    register_rest_route('wp/v2', '/test-single-recurring', [
        'methods' => 'GET',
        'callback' => 'test_single_recurring_payment_endpoint',
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'register_test_single_recurring_endpoint');




// Process one-time or recurring payment
function process_payment($amount, $donorName, $email, $orderId, $isRecurring = false)
{
    $access_token = get_tbc_access_token();
    if (!$access_token) {
        return ['status' => 'error', 'message' => 'Failed to obtain access token'];
    }

    $payment_details = [
        'amount' => [
            'total' => $amount,
            'currency' => 'GEL'
        ],
        'returnurl' => 'https://www.mautskebeli.ge/donation?orderId=' . $orderId,
        'expirationMinutes' => 10,
        'methods' => [5],
        'merchantPaymentId' => (string) $orderId,
        'callbackUrl' => 'https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/tbc-ipn',
    ];

    if ($isRecurring) {
        $payment_details['saveCard'] = true;
    }

    $response = wp_remote_post('https://api.tbcbank.ge/v1/tpay/payments', [
        'method' => 'POST',
        'headers' => [
            'Authorization' => 'Bearer ' . $access_token,
            'Content-Type' => 'application/json',
            'apikey' => TBC_API_KEY,
        ],
        'body' => json_encode($payment_details)
    ]);

    $response_body = json_decode(wp_remote_retrieve_body($response), true);

    if (wp_remote_retrieve_response_code($response) == 200 && isset($response_body['status']) && $response_body['status'] === 'Created') {
        $paymentId = $response_body['payId'];
        update_post_meta($orderId, 'transaction_id', $paymentId);

        $approvalUrl = '';
        foreach ($response_body['links'] as $link) {
            if ($link['rel'] === 'approval_url') {
                $approvalUrl = $link['uri'];
                break;
            }
        }

        if (!$approvalUrl) {
            return ['status' => 'error', 'message' => 'Approval URL not found'];
        }

        return [
            'status' => 'success',
            'message' => 'Payment initialized.',
            'paymentUrl' => $approvalUrl
        ];
    } else {
        return ['status' => 'error', 'message' => 'Payment initiation failed'];
    }
}


/**
 * Verify payment status (TBC / PayPal) and update the Donation CPT.
 * – Adds race-proof email logic: only ONE success email can ever be sent.
 *
 * Endpoint: POST /wp-json/wp/v2/verify-payment-status
 * Body:     { "orderId": 123 }
 */
/**
 * Verify payment status with TBC and update the donation post.
 * Sends exactly one success e-mail, race-proof via email_sent meta.
 */
function verify_payment_status($request)
{

    $data = $request->get_json_params();
    error_log('verify_payment_status called with data: ' . print_r($data, true));

    /* ───────────────────────── 0.  Basic validation ───────────────────────── */
    if (empty($data['orderId'])) {
        return new WP_REST_Response(
            ['status' => 'error', 'message' => 'Missing orderId'],
            400
        );
    }

    $order_id = (int) $data['orderId'];
    $pay_id = get_post_meta($order_id, 'transaction_id', true);

    if (!$pay_id) {
        return new WP_REST_Response(
            ['status' => 'error', 'message' => 'Missing transaction_id'],
            400
        );
    }

    /* ───────────────────────── 1.  Query TBC for status ───────────────────── */
    $access_token = get_tbc_access_token();
    if (!$access_token) {
        return new WP_REST_Response(
            ['status' => 'error', 'message' => 'Failed to obtain access token'],
            401
        );
    }

    $response = wp_remote_get(
        "https://api.tbcbank.ge/v1/tpay/payments/$pay_id",
        [
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
                'Content-Type' => 'application/json',
                'apikey' => TBC_API_KEY,
            ],
            'timeout' => 15,
        ]
    );

    if (is_wp_error($response)) {
        error_log('TBC verify error: ' . $response->get_error_message());
        return new WP_REST_Response(
            ['status' => 'error', 'message' => $response->get_error_message()],
            500
        );
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    /* ───────────────────────── 2.  SUCCESS branch ─────────────────────────── */
    if (isset($body['status']) && $body['status'] === 'Succeeded') {

        // (a) bookkeeping
        update_post_meta($order_id, 'payment_status', 'Succeeded');

        if (!empty($body['transactionId'])) {
            update_post_meta(
                $order_id,
                'transaction_id_response',
                sanitize_text_field($body['transactionId'])
            );
        }
        if (!empty($body['recurringCard']['recId'])) {
            update_post_meta(
                $order_id,
                'recId',
                sanitize_text_field($body['recurringCard']['recId'])
            );
        }

        /* ── RACE-PROOF EMAIL FLAG  ────────────────────────────────────────── */
        if (!get_post_meta($order_id, 'email_sent', true)) {

            // 1) atomically set the flag (timestamp helps in audits)
            update_post_meta($order_id, 'email_sent', current_time('mysql'));

            // 2) build and send the actual e-mail once
            $donor_email = get_post_meta($order_id, 'email', true);
            $donor_name = get_post_meta($order_id, 'name', true);
            $amount = get_post_meta($order_id, 'amount', true);
            $payment_type = get_post_meta($order_id, 'payment_type', true);

            if ($payment_type === 'Recurring') {
                $next_date = get_post_meta($order_id, 'next_payment_date', true);
                $recId = get_post_meta($order_id, 'recId', true);
                $cancel_link = generate_cancellation_link($recId);

                $subject = 'მადლობას გიხდით მხარდაჭერისთვის!';
                $message = "თქვენი ყოველთვიური კონტრიბუცია აძლიერებს პლათფორმას.<br><br>";
                $message .= 'მომდევნო გადახდის თარიღი - ' .
                    date('d/m/Y', strtotime($next_date)) . '<br><br>';

                /* ——— only add the paragraph when we **have** a link ——— */
                if ($cancel_link) {
                    $message .= "გასაუქმებლად გადადით <a href='" .
                        esc_url($cancel_link) . "'>ბმულზე</a><br><br>";
                }


                $message .= 'პატივისცემით,<br>Mautskebeli.ge';

            } else {  // One-time donation
                $subject = 'მადლობას გიხდით მხარდაჭერისთვის!';
                $message = "თქვენი კონტრიბუცია ({$amount} GEL) აძლიერებს პლათფორმას!<br><br>";
                $message .= 'პატივისცემით,<br>Mautskebeli.ge';
            }

            send_email($donor_email, $subject, $message);
            error_log("Success e-mail sent for order_id $order_id");

        } else {
            // We’ve already flagged + sent an e-mail in another request
            error_log("Duplicate verify call – email already sent for order_id $order_id");
        }

        return new WP_REST_Response(['status' => 'Succeeded'], 200);
    }

    /* ───────────────────────── 3.  FAILURE branch ─────────────────────────── */
    msb_set_payment_status($order_id, 'Failed');
    return new WP_REST_Response(['status' => 'Failed'], 400);
}


function get_donation_post_id_by_transaction_id($transaction_id)
{
    global $wpdb;
    $query = new WP_Query([
        'post_type' => 'donation',
        'meta_query' => [
            [
                'key' => 'transaction_id',
                'value' => $transaction_id,
                'compare' => '='
            ]
        ]
    ]);

    if ($query->have_posts()) {
        $query->the_post();
        return get_the_ID();
    }
    return null;
}


function register_verify_payment_status_endpoint()
{
    register_rest_route('wp/v2', '/verify-payment-status', [
        'methods' => 'POST',
        'callback' => 'verify_payment_status',
        'permission_callback' => '__return_true',
    ]);

}
add_action('rest_api_init', 'register_verify_payment_status_endpoint');


/* --------------------------------------------------------------------
 * TBC SERVER-TO-SERVER IPN
 * ------------------------------------------------------------------*/

/**
 * (A)  Helper – given a payId, call TBC and return the decoded body.
 */
function tbc_get_payment_details_by_payid($pay_id)
{
    $access_token = get_tbc_access_token();
    if (!$access_token) {
        return new WP_Error('tbc_token', 'Could not get TBC access token');
    }

    $response = wp_remote_get(
        "https://api.tbcbank.ge/v1/tpay/payments/$pay_id",
        [
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
                'Content-Type' => 'application/json',
                'apikey' => TBC_API_KEY,
            ],
            'timeout' => 15,
        ]
    );

    if (is_wp_error($response)) {
        return $response; // already a WP_Error
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    return $body ?: new WP_Error('tbc_json', 'Bad JSON from TBC');
}

/**
 * (B)  Helper – finalise the donation post once TBC says “Succeeded”.
 *      (Almost identical to the SUCCESS branch of verify_payment_status().)
 */
function tbc_mark_donation_succeeded($order_id, $tbc_body)
{

    // 1  bookkeeping
    update_post_meta($order_id, 'payment_status', 'Succeeded');
    if (!empty($tbc_body['transactionId'])) {
        update_post_meta(
            $order_id,
            'transaction_id_response',
            sanitize_text_field($tbc_body['transactionId'])
        );
    }
    if (!empty($tbc_body['recurringCard']['recId'])) {
        update_post_meta(
            $order_id,
            'recId',
            sanitize_text_field($tbc_body['recurringCard']['recId'])
        );
    }

    // 2  race-proof e-mail (same flag you already use)
    if (!get_post_meta($order_id, 'email_sent', true)) {

        update_post_meta($order_id, 'email_sent', current_time('mysql'));

        $donor_email = get_post_meta($order_id, 'email', true);
        $donor_name = get_post_meta($order_id, 'name', true);
        $amount = get_post_meta($order_id, 'amount', true);
        $payment_type = get_post_meta($order_id, 'payment_type', true);

        if ($payment_type === 'Recurring') {
            $next_date = get_post_meta($order_id, 'next_payment_date', true);
            $recId = get_post_meta($order_id, 'recId', true);
            $cancel_link = generate_cancellation_link($recId);

            $subject = 'მადლობას გიხდით მხარდაჭერისთვის!';
            $message = "თქვენი ყოველთვიური კონტრიბუცია აძლიერებს პლათფორმას.<br><br>";
            $message .= 'მომდევნო გადახდის თარიღი - ' .
                date('d/m/Y', strtotime($next_date)) . '<br><br>';
            if ($cancel_link) {
                $message .= "გასაუქმებლად გადადით <a href='" .
                    esc_url($cancel_link) . "'>ბმულზე</a><br><br>";
            }
            $message .= 'პატივისცემით,<br>Mautskebeli.ge';

        } else {
            $subject = 'მადლობას გიხდით მხარდაჭერისთვის!';
            $message = "თქვენი კონტრიბუცია ({$amount} GEL) აძლიერებს პლათფორმას!<br><br>";
            $message .= 'პატივისცემით,<br>Mautskebeli.ge';
        }

        send_email($donor_email, $subject, $message);
    }
}

/**
 * (C)  Main callback hit by TBC.
 *      URL:  POST /wp-json/wp/v2/tbc-ipn
 *      Body: { "payId": "xxxxxxxx" }
 */
function tbc_ipn_callback(WP_REST_Request $request)
{

    // ───────────────────────────────────────────────────────────────
    // 0) Extract payId no matter which Content‑Type TBC uses
    // ───────────────────────────────────────────────────────────────
    $pay_id = sanitize_text_field($request->get_param('payId'));

    if (empty($pay_id)) {
        // Second attempt – works when the bank posts form‑urlencoded
        $body_params = $request->get_body_params();
        if (isset($body_params['payId'])) {
            $pay_id = sanitize_text_field($body_params['payId']);
        }
    }

    if (empty($pay_id)) {
        return new WP_REST_Response(
            ['status' => 'error', 'message' => 'Missing payId'],
            400
        );
    }

    // Optional: keep raw payloads in debug.log for troubleshooting
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('[TBC-IPN] Raw input: ' . $request->get_body());
    }

    // ───────────────────────────────────────────────────────────────
    // 1) Query TBC for the *authoritative* payment status
    // ───────────────────────────────────────────────────────────────
    $body = tbc_get_payment_details_by_payid($pay_id);
    if (is_wp_error($body)) {
        error_log('TBC IPN error (' . $pay_id . '): ' . $body->get_error_message());
        return new WP_REST_Response(
            ['status' => 'error', 'message' => 'TBC query failed'],
            500
        );
    }

    // ───────────────────────────────────────────────────────────────
    // 2) Find our donation post that stores this payId
    // ───────────────────────────────────────────────────────────────
    $order_id = get_donation_post_id_by_transaction_id($pay_id);
    if (!$order_id) {
        // Nothing to update, but still acknowledge the callback so
        // TBC stops retrying.
        error_log('TBC IPN warning (' . $pay_id . '): post not found');
        return new WP_REST_Response(['status' => 'ok'], 200);
    }

    // ───────────────────────────────────────────────────────────────
    // 3) Act on the final status
    // ───────────────────────────────────────────────────────────────
    if (isset($body['status']) && $body['status'] === 'Succeeded') {
        tbc_mark_donation_succeeded($order_id, $body);
    } else {
        update_post_meta($order_id, 'payment_status', 'Failed');
    }

    return new WP_REST_Response(['status' => 'ok'], 200);
}

/**
 * (D)  Expose the route.
 */
function register_tbc_ipn_endpoint()
{
    register_rest_route(
        'wp/v2',
        '/tbc-ipn',
        [
            'methods' => 'POST',
            'callback' => 'tbc_ipn_callback',
            'permission_callback' => '__return_true', // TBC posts anonymously
        ]
    );
}
add_action('rest_api_init', 'register_tbc_ipn_endpoint');

/* --------------------------------------------------------------------
 * “Pending-sweeper” cron job
 * ---------------------------------------------------------------
 *  ▸ Runs every 10 min.
 *  ▸ Finds any donation that is still “Pending” > 15 min after creation.
 *  ▸ Asks TBC for the real status and flips the post to Succeeded/Failed,
 *    calling tbc_mark_donation_succeeded() so the normal e-mail is sent.
 *  ▸ Guarantees the site never gets stuck in Pending even if IPN fails.
 * ------------------------------------------------------------------*/

/** 1)  Add a custom interval ───────────────────────────────────── */
add_filter('cron_schedules', function ($s) {
    if (!isset($s['ten_minutes'])) {
        $s['ten_minutes'] = ['interval' => 600, 'display' => 'Every 10 Minutes'];
    }
    return $s;
});

/** 2)  Schedule the event once on init ─────────────────────────── */
function msb_schedule_pending_sweeper()
{
    if (!wp_next_scheduled('msb_pending_sweeper_event')) {
        wp_schedule_event(time() + 600, 'ten_minutes', 'msb_pending_sweeper_event');
    }
}
add_action('init', 'msb_schedule_pending_sweeper');

/** 3)  Hook the callback into that event ───────────────────────── */
add_action('msb_pending_sweeper_event', 'msb_sweep_pending_donations');

/** 4)  The actual sweeper logic  ───────────────────────────────── */
function msb_sweep_pending_donations()
{

    /* look for “Pending” posts older than 15 min */
    $cutoff = current_time('timestamp') - 15 * MINUTE_IN_SECONDS;
    $cutoff_mysql = date('Y-m-d H:i:s', $cutoff);

    $q = new WP_Query([
        'post_type' => 'donation',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'meta_query' => [
            ['key' => 'payment_status', 'value' => 'Pending'],
        ],
        'date_query' => [
            ['column' => 'post_date', 'before' => $cutoff_mysql],
        ],
    ]);

    if (!$q->posts) {
        return;
    }

    foreach ($q->posts as $order_id) {

        $pay_id = get_post_meta($order_id, 'transaction_id', true);

        /* (A) no payId stored – just mark as Failed */
        if (!$pay_id) {
            update_post_meta($order_id, 'payment_status', 'Failed');
            continue;
        }

        /* (B) ask TBC for the authoritative status */
        $tbc = tbc_get_payment_details_by_payid($pay_id);
        if (is_wp_error($tbc)) {
            error_log("[PENDING-SWEEPER] TBC query failed for $pay_id – {$tbc->get_error_message()}");
            continue;
        }

        /* (C) act on the answer */
        if (isset($tbc['status']) && $tbc['status'] === 'Succeeded') {
            msb_set_payment_status($order_id, 'Succeeded');
            tbc_mark_donation_succeeded($order_id, $tbc);
            error_log("[PENDING-SWEEPER] $order_id marked Succeeded via cron.");

        } elseif (isset($tbc['status']) && $tbc['status'] === 'Failed') {
            msb_set_payment_status($order_id, 'Failed');
            error_log("[PENDING-SWEEPER] $order_id marked Failed via cron.");
        }
    }

    wp_reset_postdata();
}
/* ------------------------------------------------------------------*/




/// Create donation post in the system with payment status added to post content
function create_donation_post($data, $payment_status)
{
    // Create a new post of type 'donation'
    $post_id = wp_insert_post([
        'post_type' => 'donation',
        'post_title' => 'Donation from ' . $data['donorName'],
        'post_content' => '',  // Remove payment status from content
        'post_status' => 'publish'
    ]);

    if (is_wp_error($post_id)) {
        return null; // Handle error as needed
    }

    // Update custom fields using update_post_meta
    update_post_meta($post_id, 'order_id', $post_id);
    update_post_meta($post_id, 'name', sanitize_text_field($data['donorName']));
    update_post_meta($post_id, 'email', sanitize_email($data['donorEmail']));
    update_post_meta($post_id, 'amount', floatval($data['donationAmount']));

    // Check if donorPhone exists before updating
    if (isset($data['donorPhone'])) {
        update_post_meta($post_id, 'phone', sanitize_text_field($data['donorPhone']));
    } else {
        update_post_meta($post_id, 'phone', ''); // Or set to a default value if desired
        error_log('donorPhone is not set for order_id: ' . $post_id);
    }

    // Set initial payment status
    update_post_meta($post_id, 'payment_status', sanitize_text_field($payment_status));

    // Set payment type
    $payment_type = (isset($data['isRecurring']) && $data['isRecurring']) ? 'Recurring' : 'One-Time';
    update_post_meta($post_id, 'payment_type', sanitize_text_field($payment_type));

    // Store the next payment date for recurring payments (+1 month from signup)
    if (isset($data['isRecurring']) && $data['isRecurring']) {
        $next_payment_date = date('Ymd', strtotime("+1 month", current_time('timestamp')));
        update_post_meta($post_id, 'next_payment_date', $next_payment_date);

        update_post_meta($post_id, 'retry_count', 0);
    }

    return $post_id;
}

// Handle payment completion in WooCommerce
add_action('woocommerce_payment_complete', 'update_donation_post_with_payment_status', 10, 1);

// Update donation post with payment status after WooCommerce payment completes
function update_donation_post_with_payment_status($order_id)
{
    // Get the WooCommerce order object
    $order = wc_get_order($order_id);

    if ($order) {
        // Get donor details from the order
        $donor_email = $order->get_billing_email();
        $donation_post_id = get_donation_post_id_by_email($donor_email);

        if ($donation_post_id) {
            // Update payment status and transaction ID using update_post_meta
            update_post_meta($donation_post_id, 'payment_status', 'Succeeded');
            update_post_meta($donation_post_id, 'transaction_id', sanitize_text_field($order->get_transaction_id()));
        }
    }
}
// Hook into WooCommerce failed payment event
add_action('woocommerce_order_status_failed', 'update_donation_post_failed_status', 10, 1);

// Update donation post with failed payment status
function update_donation_post_failed_status($order_id)
{
    // Get the WooCommerce order object
    $order = wc_get_order($order_id);

    if ($order) {
        $donor_email = $order->get_billing_email();
        $donation_post_id = get_donation_post_id_by_email($donor_email);

        if ($donation_post_id) {
            update_post_meta($donation_post_id, 'payment_status', 'Failed'); // Mark as failed
        }
    }
}

// Helper function to get donation post ID by donor email
function get_donation_post_id_by_email($email)
{
    $args = array(
        'post_type' => 'donation',
        'meta_query' => array(
            array(
                'key' => 'email',
                'value' => $email,
                'compare' => '='
            )
        ),
        'posts_per_page' => 1,
    );

    $query = new WP_Query($args);

    if ($query->have_posts()) {
        $query->the_post();
        return get_the_ID(); // Return the ID of the found post
    }

    return null; // No matching post found
}

// Retrieve the access token for TBC API
function get_tbc_access_token()
{

    // ── 1) reuse if we already have a token that is still valid ───────────
    $token = get_option('tbc_access_token');
    $expires = (int) get_option('tbc_access_token_expires', 0);

    if ($token && time() < $expires) {
        return $token;
    }

    // ── 2) ask TBC for a fresh token ──────────────────────────────────────
    $basic = base64_encode(TBC_CLIENT_ID . ':' . TBC_CLIENT_SECRET);

    $response = wp_remote_post(
        'https://api.tbcbank.ge/v1/tpay/access-token',
        [
            'method' => 'POST',
            'headers' => [
                // !!! this is the part that was wrong before
                'Authorization' => 'Basic ' . $basic,
                'Content-Type' => 'application/x-www-form-urlencoded',
                'apikey' => TBC_API_KEY,
            ],
            'body' => 'grant_type=client_credentials',
            'timeout' => 15,
        ]
    );

    if (is_wp_error($response)) {
        error_log('TBC token error: ' . $response->get_error_message());
        return null;
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    if (empty($body['access_token'])) {
        error_log('TBC token error: ' . print_r($body, true));
        return null;
    }

    // save token in wp_options – 5 min safety margin before expiry
    update_option('tbc_access_token', $body['access_token']);
    update_option('tbc_access_token_expires', time() + $body['expires_in'] - 300);

    return $body['access_token'];
}

// Register the donation REST endpoint
function register_donation_endpoint()
{
    register_rest_route('wp/v2', '/submit-donation/', array(
        'methods' => 'POST',
        'callback' => 'handle_donation',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'register_donation_endpoint');

// Fetch the TBC token on initialization
add_action('init', function () {
    if (current_user_can('administrator')) {
        $token = get_tbc_access_token();
        error_log('TBC Access Token: ' . $token);
    }
});



/**
 * Check all "Recurring" donation posts whose "next_payment_date"
 * falls within the specified month/year, and see if they were marked "Succeeded".
 *
 * @param int $month  The month (1-12).
 * @param int $year   The year (4-digit).
 * @return array
 */
function check_recurring_donations_by_month($month, $year)
{
    // Convert $month/$year to start-of-month and end-of-month in Ymd format
    // E.g. 2024-11-01 => 20241101, 2024-11-30 => 20241130
    // Or 2024-12 => 20241201, 20241231, etc.
    $start_of_month = date('Ymd', strtotime("{$year}-{$month}-01"));
    // Get the last day of that month:
    $end_of_month = date('Ymd', strtotime("last day of {$year}-{$month}"));

    // Build a query to fetch "donation" posts
    $args = array(
        'post_type' => 'donation',
        'posts_per_page' => -1,
        'meta_query' => array(
            // Must be recurring
            array(
                'key' => 'payment_type',
                'value' => 'Recurring',
                'compare' => '='
            ),
            // Must NOT be canceled
            array(
                'key' => 'payment_status',
                'value' => 'Cancelled',
                'compare' => '!='
            ),
            // next_payment_date between start_of_month / end_of_month
            array(
                'key' => 'next_payment_date',
                'value' => array($start_of_month, $end_of_month),
                'compare' => 'BETWEEN',
                'type' => 'NUMERIC',  // because we store "Ymd"
            ),
        ),
    );

    $query = new WP_Query($args);
    $results = array();

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $donation_post_id = get_the_ID();
            $recId = get_post_meta($donation_post_id, 'recId', true);
            $paymentStatus = get_post_meta($donation_post_id, 'payment_status', true);
            $amount = get_post_meta($donation_post_id, 'amount', true);
            $nextPaymentDate = get_post_meta($donation_post_id, 'next_payment_date', true);

            // Decide "status_detail" based on payment_status
            // For example, if "Succeeded", show "Charged OK"
            // If "Failed" or something else, show "Might be an issue"
            $status_detail = '';
            if ($paymentStatus === 'Succeeded') {
                $status_detail = 'Charged OK';
            } elseif ($paymentStatus === 'Failed') {
                $status_detail = 'Payment failed or not processed yet';
            } else {
                // Possibly "Pending" or something else
                $status_detail = 'Unknown (not Succeeded)';
            }

            $results[] = array(
                'post_id' => $donation_post_id,
                'recId' => $recId,
                'amount' => $amount,
                'payment_status' => $paymentStatus,
                'next_payment_date' => $nextPaymentDate,
                'status_detail' => $status_detail,
            );
        }
        wp_reset_postdata();
    }

    return $results;
}



/**
 * Add an admin submenu page to check recurring donations by month.
 */
add_action('admin_menu', function () {
    add_submenu_page(
        'tools.php',                // Parent slug => under "Tools"
        'Check Recurring Charges',  // Page Title
        'Check Recurring',          // Menu Title
        'manage_options',           // Capability needed
        'check-recurring-charges',  // Menu slug
        'my_recurring_check_page'   // Callback
    );
});

/**
 * Callback function to output the page contents.
 */
function my_recurring_check_page()
{
    if (!current_user_can('manage_options')) {
        return;
    }

    // Default is to show "December 2024" or "January 2025" as you requested
    // but let's allow a small form to choose any month/year.
    $default_month = date('n'); // current month numeric
    $default_year = date('Y'); // current year

    // If user submitted the form, get the chosen month/year
    $chosen_month = isset($_POST['my_month']) ? intval($_POST['my_month']) : $default_month;
    $chosen_year = isset($_POST['my_year']) ? intval($_POST['my_year']) : $default_year;

    // Get results
    $results = check_recurring_donations_by_month($chosen_month, $chosen_year);

    // Build a small HTML form
    echo '<div class="wrap">';
    echo '<h1>Check Recurring Donations</h1>';
    echo '<form method="post" style="margin-bottom: 20px;">';
    echo '<p>Select month/year to check:</p>';
    echo 'Month: <input type="number" name="my_month" value="' . esc_attr($chosen_month) . '" min="1" max="12" style="width:60px;"> ';
    echo 'Year: <input type="number" name="my_year" value="' . esc_attr($chosen_year) . '" min="2000" max="2100" style="width:80px;"> ';
    submit_button('Check Now', 'primary', 'submit', false);
    echo '</form>';

    if (empty($results)) {
        echo '<p>No recurring donations found for that month.</p>';
    } else {
        // Show a table
        echo '<table class="widefat striped">';
        echo '<thead><tr>';
        echo '<th>Donation ID</th>';
        echo '<th>recId</th>';
        echo '<th>Amount</th>';
        echo '<th>payment_status</th>';
        echo '<th>next_payment_date</th>';
        echo '<th>Info</th>';
        echo '</tr></thead><tbody>';

        foreach ($results as $row) {
            echo '<tr>';
            echo '<td>' . esc_html($row['post_id']) . '</td>';
            echo '<td>' . esc_html($row['recId']) . '</td>';
            echo '<td>' . esc_html($row['amount']) . '</td>';
            echo '<td>' . esc_html($row['payment_status']) . '</td>';
            echo '<td>' . esc_html($row['next_payment_date']) . '</td>';
            echo '<td>' . esc_html($row['status_detail']) . '</td>';
            echo '</tr>';
        }
        echo '</tbody></table>';
    }
    echo '</div>';
}


// Add CORS headers for images in wp-content/uploads
function add_cors_headers()
{
    if (strpos($_SERVER['REQUEST_URI'], '/wp-content/uploads/') !== false) {
        header('Access-Control-Allow-Origin: https://www.mautskebeli.ge');
    }
}
add_action('init', 'add_cors_headers');





/**
 * Converts a date string to YYYYMMDD if it's in dd/mm/YYYY format.
 * If it's already YYYYMMDD, just return it.
 * If it doesn't match known patterns, return it unchanged.
 */
function normalize_date_to_ymd($date_string)
{
    // If already 8 digits (YYYYMMDD), return as-is
    if (preg_match('/^\d{8}$/', $date_string)) {
        return $date_string;
    }

    // If it looks like dd/mm/YYYY (or d/m/YYYY)
    if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $date_string, $matches)) {
        $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
        $month = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
        $year = $matches[3];
        // Build into YYYYMMDD
        return $year . $month . $day;
    }

    // Otherwise, return the original string as a fallback
    return $date_string;
}



add_action('init', function () {
    error_log('Test debug.log is working!');
});



/**
 * Enforce YYYYMMDD on any save of next_payment_date via ACF.
 */
add_filter(
    'acf/update_value/name=next_payment_date',
    function ($value, $post_id, $field) {
        // If already 8 digits, leave it; otherwise normalize
        if (preg_match('/^\d{8}$/', $value)) {
            return $value;
        }
        return normalize_date_to_ymd($value);
    },
    10,
    3
);


//Roles defining code




/**
 * 1) Register the "donation" custom post type.
 *    (This registration uses default capabilities so that Administrators see it as usual.)
 */
function register_donation_post_type()
{
    $labels = array(
        'name' => 'Donations',
        'singular_name' => 'Donation',
    );

    register_post_type('donation', array(
        'labels' => $labels,
        'public' => false,   // Set to false if you do not want it on the front end
        'show_ui' => true,    // So it appears in wp-admin for those with sufficient permission (Administrators)
        'has_archive' => false,
        'supports' => array('title', 'editor'),
    ));
}
add_action('init', 'register_donation_post_type');

/**
 * 2) Hide the Donations menu in the admin sidebar for non-administrators.
 *
 * This ensures that only Administrators see the Donations menu.
 */
function hide_donations_for_non_admin()
{
    if (!current_user_can('administrator')) {
        remove_menu_page('edit.php?post_type=donation');
    }
}
add_action('admin_menu', 'hide_donations_for_non_admin', 999);

/**
 * 3) Prevent non-admin users from accessing donation pages via a direct URL.
 *
 * If a non-administrator tries to access a donation post, redirect them to the dashboard.
 */
function block_donation_page_access_for_non_admin()
{
    if (!current_user_can('administrator')) {
        global $pagenow;
        // Block list views of the donation CPT
        if (isset($_GET['post_type']) && $_GET['post_type'] === 'donation') {
            wp_redirect(admin_url());
            exit;
        }
        // Block single donation edit screens (if they try to access via URL)
        if ($pagenow == 'post.php' && isset($_GET['post'])) {
            $post_id = intval($_GET['post']);
            if ('donation' === get_post_type($post_id)) {
                wp_redirect(admin_url());
                exit;
            }
        }
    }
}
add_action('admin_init', 'block_donation_page_access_for_non_admin');


/**
 * Remove default dashboard widgets for Editors (Admin2).
 * Administrators retain all widgets as normal.
 */
function remove_dashboard_widgets_for_editor()
{
    if (current_user_can('editor') && !current_user_can('administrator')) {
        // "At a Glance"
        remove_meta_box('dashboard_right_now', 'dashboard', 'normal');

        // "Quick Draft"
        remove_meta_box('dashboard_quick_press', 'dashboard', 'side');

        // "Activity"
        remove_meta_box('dashboard_activity', 'dashboard', 'normal');

        // You can also remove other default widgets if desired, for example:
        // remove_meta_box('dashboard_primary', 'dashboard', 'side');   // WordPress News
        // remove_meta_box('dashboard_secondary', 'dashboard', 'side'); // Secondary feed
    }
}
add_action('wp_dashboard_setup', 'remove_dashboard_widgets_for_editor', 999);





/**
 * 1) Add “Export Successful Donations” under Tools
 */
add_action('admin_menu', function () {
    add_submenu_page(
        'tools.php',
        'Export Successful Donations',
        'Export Successful Donations',
        'manage_options',
        'export-successful-donations',
        'esd_render_export_page'
    );
});

/**
 * 2) Render the export page with TWO separate forms
 */
function esd_render_export_page()
{
    if (!current_user_can('manage_options')) {
        wp_die('Insufficient permissions');
    }
    ?>
    <div class="wrap">
        <h1>Export Successful Donations</h1>

        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <?php wp_nonce_field('esd_export_pdf', 'esd_nonce_pdf'); ?>
            <input type="hidden" name="action" value="esd_export_pdf">
            <?php submit_button('Download PDF', 'primary'); ?>
        </form>

        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="margin-top:1em;">
            <?php wp_nonce_field('esd_export_xlsx', 'esd_nonce_xlsx'); ?>
            <input type="hidden" name="action" value="esd_export_xlsx">
            <?php submit_button('Download Excel', 'secondary'); ?>
        </form>
    </div>
    <?php
}

/**
 * 3a) Handle the PDF export
 */
add_action('admin_post_esd_export_pdf', 'esd_export_pdf');
function esd_export_pdf()
{
    if (
        !current_user_can('manage_options')
        || !wp_verify_nonce($_POST['esd_nonce_pdf'] ?? '', 'esd_export_pdf')
    ) {
        wp_die('Permission denied');
    }

    // 1) fetch succeeded donations
    $q = new WP_Query([
        'post_type' => 'donation',
        'posts_per_page' => -1,
        'meta_query' => [['key' => 'payment_status', 'value' => 'Succeeded']],
    ]);

    // 2) build sheet
    $ss = new Spreadsheet();
    $ss->getProperties()->setTitle('Successful Donations');
    $ss->getDefaultStyle()
        ->getFont()
        ->setName('DejaVu Sans')
        ->setSize(10);
    $sheet = $ss->getActiveSheet();

    // 3) headers
    $headers = ['Name', 'Email', 'Amount (GEL)', 'Type', 'Date'];
    foreach ($headers as $i => $text) {
        $col = Coordinate::stringFromColumnIndex($i + 1);
        $sheet->setCellValue("{$col}1", $text);
    }
    $lastCol = Coordinate::stringFromColumnIndex(count($headers));
    $sheet->getStyle("A1:{$lastCol}1")->getFont()->setBold(true);

    // 4) data rows
    $row = 2;
    while ($q->have_posts()) {
        $q->the_post();
        $id = get_the_ID();
        $data = [
            get_post_meta($id, 'name', true),
            get_post_meta($id, 'email', true),
            get_post_meta($id, 'amount', true),
            get_post_meta($id, 'payment_type', true),
            get_the_date('Y-m-d', $id),
        ];
        foreach ($data as $i => $val) {
            $col = Coordinate::stringFromColumnIndex($i + 1);
            $sheet->setCellValue("{$col}{$row}", $val);
        }
        $row++;
    }
    wp_reset_postdata();

    // 5) autosize, borders, alignment, landscape
    foreach (range(1, count($headers)) as $i) {
        $c = Coordinate::stringFromColumnIndex($i);
        $sheet->getColumnDimension($c)->setAutoSize(true);
    }
    $sheet->getStyle("A1:{$lastCol}" . ($row - 1))
        ->getBorders()->getAllBorders()
        ->setBorderStyle(Border::BORDER_THIN);
    $sheet->getStyle("C2:D" . ($row - 1))
        ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->getPageSetup()
        ->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE)
        ->setFitToWidth(1);

    // 6) send PDF
    if (ob_get_length())
        ob_end_clean();
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="successful-donations.pdf"');
    header('Cache-Control: max-age=0');

    $writer = new PdfWriter($ss);
    $writer->save('php://output');
    exit;
}

/**
 * 3b) Handle the XLSX export (with Georgian‐capable font)
 */
add_action('admin_post_esd_export_xlsx', 'esd_export_xlsx');
function esd_export_xlsx()
{
    if (
        !current_user_can('manage_options')
        || !wp_verify_nonce($_POST['esd_nonce_xlsx'] ?? '', 'esd_export_xlsx')
    ) {
        wp_die('Permission denied');
    }

    // 1) fetch succeeded donations
    $q = new WP_Query([
        'post_type' => 'donation',
        'posts_per_page' => -1,
        'meta_query' => [['key' => 'payment_status', 'value' => 'Succeeded']],
    ]);

    // 2) build sheet
    $ss = new Spreadsheet();
    $ss->getProperties()->setTitle('Successful Donations');

    // ← here's the only change: use Sylfaen (or another Georgian‐capable font)
    $ss->getDefaultStyle()
        ->getFont()
        ->setName('Sylfaen')
        ->setSize(10);

    $sheet = $ss->getActiveSheet();

    // 3) headers
    $headers = ['Name', 'Email', 'Amount (GEL)', 'Type', 'Date'];
    foreach ($headers as $i => $text) {
        $col = Coordinate::stringFromColumnIndex($i + 1);
        $sheet->setCellValue("{$col}1", $text);
    }
    $lastCol = Coordinate::stringFromColumnIndex(count($headers));

    // 4) data rows
    $row = 2;
    while ($q->have_posts()) {
        $q->the_post();
        $id = get_the_ID();
        $data = [
            get_post_meta($id, 'name', true),
            get_post_meta($id, 'email', true),
            get_post_meta($id, 'amount', true),
            get_post_meta($id, 'payment_type', true),
            get_the_date('Y-m-d', $id),
        ];
        foreach ($data as $i => $val) {
            $col = Coordinate::stringFromColumnIndex($i + 1);
            $sheet->setCellValue("{$col}{$row}", $val);
        }
        $row++;
    }
    wp_reset_postdata();

    // 5) autosize all columns
    foreach (range(1, count($headers)) as $i) {
        $c = Coordinate::stringFromColumnIndex($i);
        $sheet->getColumnDimension($c)->setAutoSize(true);
    }

    // 6) re‐apply the font across every cell (to catch any Georgian in the data)
    $sheet->getStyle("A1:{$lastCol}" . ($row - 1))
        ->getFont()
        ->setName('Sylfaen');

    // 7) send XLSX
    if (ob_get_length())
        ob_end_clean();
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="successful-donations.xlsx"');
    header('Cache-Control: max-age=0');

    $writer = new XlsxWriter($ss);
    $writer->save('php://output');
    exit;
}

/**
 * ============================================================================
 * DONATION ANALYTICS REST API ENDPOINTS
 * ============================================================================
 */

/**
 * Register all analytics endpoints
 */
function register_donation_analytics_endpoints()
{
    $namespace = 'mautskebeli/v1';

    // Overview statistics
    register_rest_route($namespace, '/analytics/overview', [
        'methods' => 'GET',
        'callback' => 'get_donation_overview',
        'permission_callback' => 'check_analytics_permission',
    ]);

    // Monthly statistics
    register_rest_route($namespace, '/analytics/monthly', [
        'methods' => 'GET',
        'callback' => 'get_monthly_statistics',
        'permission_callback' => 'check_analytics_permission',
    ]);

    // Recurring donor metrics
    register_rest_route($namespace, '/analytics/recurring', [
        'methods' => 'GET',
        'callback' => 'get_recurring_metrics',
        'permission_callback' => 'check_analytics_permission',
    ]);

    // Failed payments analysis
    register_rest_route($namespace, '/analytics/failures', [
        'methods' => 'GET',
        'callback' => 'get_failure_analysis',
        'permission_callback' => 'check_analytics_permission',
    ]);

    // Latest donations list
    register_rest_route($namespace, '/analytics/donations', [
        'methods' => 'GET',
        'callback' => 'get_donations_list',
        'permission_callback' => 'check_analytics_permission',
    ]);

    // Export data
    register_rest_route($namespace, '/analytics/export', [
        'methods' => 'GET',
        'callback' => 'export_donations_data',
        'permission_callback' => 'check_analytics_permission',
    ]);
}
add_action('rest_api_init', 'register_donation_analytics_endpoints');

/**
 * Permission callback - you can customize this based on your needs
 * For now, allowing public access for the dashboard
 * Later, add API key authentication
 */
/**
 * Secure permission callback with API key authentication
 */
function check_analytics_permission($request)
{
    // Get API key from header
    $api_key = $request->get_header('X-API-Key');

    // Get stored API key (we'll set this in a moment)
    $valid_key = get_option('donation_dashboard_api_key');

    // If no key is set yet, generate one
    if (!$valid_key) {
        $valid_key = wp_generate_password(32, false);
        update_option('donation_dashboard_api_key', $valid_key);
    }

    // Check if the provided key matches
    if ($api_key === $valid_key) {
        return true;
    }

    // Return error if unauthorized
    return new WP_Error(
        'rest_forbidden',
        'Invalid API key',
        ['status' => 401]
    );
}

/**
 * Add admin page to view/regenerate API key
 */
function add_donation_dashboard_api_settings()
{
    add_submenu_page(
        'tools.php',
        'Donation Dashboard API',
        'Dashboard API Key',
        'manage_options',
        'donation-dashboard-api',
        'render_donation_dashboard_api_page'
    );
}
add_action('admin_menu', 'add_donation_dashboard_api_settings');

function render_donation_dashboard_api_page()
{
    if (!current_user_can('manage_options')) {
        wp_die('Insufficient permissions');
    }

    // Handle API key regeneration
    if (isset($_POST['regenerate_api_key']) && check_admin_referer('regenerate_api_key')) {
        $new_key = wp_generate_password(32, false);
        update_option('donation_dashboard_api_key', $new_key);
        echo '<div class="notice notice-success"><p>API Key regenerated successfully!</p></div>';
    }

    $api_key = get_option('donation_dashboard_api_key');
    if (!$api_key) {
        $api_key = wp_generate_password(32, false);
        update_option('donation_dashboard_api_key', $api_key);
    }

    ?>
    <div class="wrap">
        <h1>Donation Dashboard API Key</h1>
        <p>Use this API key to authenticate requests from your Next.js dashboard.</p>

        <table class="form-table">
            <tr>
                <th>API Key:</th>
                <td>
                    <code style="background: #f0f0f0; padding: 10px; display: block; font-size: 14px;">
                            <?php echo esc_html($api_key); ?>
                        </code>
                    <button type="button" onclick="navigator.clipboard.writeText('<?php echo esc_js($api_key); ?>')"
                        class="button">
                        Copy to Clipboard
                    </button>
                </td>
            </tr>
            <tr>
                <th>API Endpoints:</th>
                <td>
                    <ul>
                        <li><code><?php echo home_url('/wp-json/mautskebeli/v1/analytics/overview'); ?></code></li>
                        <li><code><?php echo home_url('/wp-json/mautskebeli/v1/analytics/monthly'); ?></code></li>
                        <li><code><?php echo home_url('/wp-json/mautskebeli/v1/analytics/recurring'); ?></code></li>
                        <li><code><?php echo home_url('/wp-json/mautskebeli/v1/analytics/failures'); ?></code></li>
                        <li><code><?php echo home_url('/wp-json/mautskebeli/v1/analytics/donations'); ?></code></li>
                    </ul>
                </td>
            </tr>
        </table>

        <form method="post" onsubmit="return confirm('This will invalidate the old API key. Continue?');">
            <?php wp_nonce_field('regenerate_api_key'); ?>
            <input type="hidden" name="regenerate_api_key" value="1">
            <?php submit_button('Regenerate API Key', 'secondary'); ?>
        </form>

        <hr>

        <h3>Test Your API</h3>
        <p>Test the API by running this command in your terminal:</p>
        <pre style="background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 5px; overflow-x: auto;">
    curl -H "X-API-Key: <?php echo esc_html($api_key); ?>" \
    <?php echo home_url('/wp-json/mautskebeli/v1/analytics/overview'); ?>
            </pre>
    </div>
    <?php
}

/**
 * Get overview statistics
 */
function get_donation_overview($request)
{
    $timeframe = $request->get_param('timeframe') ?: 'all'; // all, year, month, week

    $date_query = get_date_query_args($timeframe);

    // Total donations (ALL posts - backfilled posts represent real charges too)
    $total_query = new WP_Query([
        'post_type' => 'donation',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'date_query' => $date_query,
    ]);

    // Successful donations (ALL succeeded - backfilled = real money)
    $success_query = new WP_Query([
        'post_type' => 'donation',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'meta_query' => [
            ['key' => 'payment_status', 'value' => 'Succeeded'],
        ],
        'date_query' => $date_query,
    ]);

    // Calculate total amount from ALL succeeded donations
    $total_amount = 0;
    $one_time_amount = 0;
    $recurring_amount = 0;

    foreach ($success_query->posts as $post_id) {
        $amount = floatval(get_post_meta($post_id, 'amount', true));
        $type = get_post_meta($post_id, 'payment_type', true);

        $total_amount += $amount;
        if ($type === 'Recurring') {
            $recurring_amount += $amount;
        } else {
            $one_time_amount += $amount;
        }
    }

    // Active recurring donors - count UNIQUE recIds with valid next_payment_date
    // Must have transaction_id (real charge) to be considered active
    $active_recurring = new WP_Query([
        'post_type' => 'donation',
        'posts_per_page' => -1,
        'orderby' => 'ID',
        'order' => 'DESC',
        'meta_query' => [
            'relation' => 'AND',
            ['key' => 'payment_type', 'value' => 'Recurring'],
            ['key' => 'payment_status', 'value' => 'Succeeded'],
            ['key' => 'recId', 'compare' => 'EXISTS'],
            ['key' => 'recId', 'value' => '', 'compare' => '!='],
            ['key' => 'next_payment_date', 'compare' => 'EXISTS'],
            ['key' => 'next_payment_date', 'value' => '', 'compare' => '!='],
            ['key' => 'transaction_id', 'compare' => 'EXISTS'],
            ['key' => 'transaction_id', 'value' => '', 'compare' => '!='],
        ],
    ]);

    // Deduplicate by recId and calculate MRR from unique active donors
    $unique_recIds = [];
    $mrr = 0;
    foreach ($active_recurring->posts as $post) {
        $recId = get_post_meta($post->ID, 'recId', true);
        if ($recId && !isset($unique_recIds[$recId])) {
            $unique_recIds[$recId] = true;
            $mrr += floatval(get_post_meta($post->ID, 'amount', true));
        }
    }
    $active_recurring_count = count($unique_recIds);

    // Failed donations count
    $failed_query = new WP_Query([
        'post_type' => 'donation',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'meta_query' => [
            ['key' => 'payment_status', 'value' => 'Failed'],
        ],
        'date_query' => $date_query,
    ]);

    $total_with_status = $success_query->found_posts + $failed_query->found_posts;
    $success_rate = $total_with_status > 0
        ? round(($success_query->found_posts / $total_with_status) * 100, 2)
        : 0;

    return new WP_REST_Response([
        'total_donations' => $total_with_status,
        'successful_donations' => $success_query->found_posts,
        'failed_donations' => $failed_query->found_posts,
        'success_rate' => $success_rate,
        'total_amount' => round($total_amount, 2),
        'one_time_amount' => round($one_time_amount, 2),
        'recurring_amount' => round($mrr, 2), // MRR from unique active donors
        'active_recurring_donors' => $active_recurring_count,
        'average_donation' => $success_query->found_posts > 0
            ? round($total_amount / $success_query->found_posts, 2)
            : 0,
    ], 200);
}

/**
 * Get monthly statistics for charts
 * Counts ALL succeeded donations (backfilled = real money too)
 */
function get_monthly_statistics($request)
{
    $months = intval($request->get_param('months')) ?: 12;
    $stats = [];

    for ($i = $months - 1; $i >= 0; $i--) {
        $date = date('Y-m-01', strtotime("-$i months"));
        $year = date('Y', strtotime($date));
        $month = date('m', strtotime($date));
        $month_name = date('M Y', strtotime($date));

        // All donations this month (succeeded + failed)
        $success_query = new WP_Query([
            'post_type' => 'donation',
            'posts_per_page' => -1,
            'fields' => 'ids',
            'meta_query' => [
                ['key' => 'payment_status', 'value' => 'Succeeded'],
            ],
            'date_query' => [
                [
                    'year' => $year,
                    'month' => $month,
                ]
            ],
        ]);

        $failed_query = new WP_Query([
            'post_type' => 'donation',
            'posts_per_page' => -1,
            'fields' => 'ids',
            'meta_query' => [
                ['key' => 'payment_status', 'value' => 'Failed'],
            ],
            'date_query' => [
                [
                    'year' => $year,
                    'month' => $month,
                ]
            ],
        ]);

        $query = (object)[
            'found_posts' => $success_query->found_posts + $failed_query->found_posts
        ];

        $total_amount = 0;
        $recurring_count = 0;
        $one_time_count = 0;

        foreach ($success_query->posts as $post_id) {
            $amount = floatval(get_post_meta($post_id, 'amount', true));
            $type = get_post_meta($post_id, 'payment_type', true);

            $total_amount += $amount;
            if ($type === 'Recurring') {
                $recurring_count++;
            } else {
                $one_time_count++;
            }
        }

        $stats[] = [
            'month' => $month_name,
            'year' => $year,
            'month_num' => $month,
            'total_count' => $query->found_posts,
            'successful_count' => $success_query->found_posts,
            'failed_count' => $query->found_posts - $success_query->found_posts,
            'total_amount' => round($total_amount, 2),
            'recurring_count' => $recurring_count,
            'one_time_count' => $one_time_count,
            'success_rate' => $query->found_posts > 0
                ? round(($success_query->found_posts / $query->found_posts) * 100, 2)
                : 0,
        ];
    }

    return new WP_REST_Response($stats, 200);
}

/**
 * Get recurring donor metrics
 * Counts UNIQUE recIds - active donors have transaction_id + next_payment_date
 */
function get_recurring_metrics($request)
{
    // Get ALL recurring donations with recId
    $all_recurring = new WP_Query([
        'post_type' => 'donation',
        'posts_per_page' => -1,
        'orderby' => 'ID',
        'order' => 'DESC', // Newest first
        'meta_query' => [
            'relation' => 'AND',
            ['key' => 'payment_type', 'value' => 'Recurring'],
            ['key' => 'recId', 'compare' => 'EXISTS'],
            ['key' => 'recId', 'value' => '', 'compare' => '!='],
        ],
    ]);

    // Group posts by recId and find the canonical (newest with transaction_id) post for each
    $recId_data = [];
    foreach ($all_recurring->posts as $post) {
        $recId = get_post_meta($post->ID, 'recId', true);
        if (!$recId) continue;
        
        $txn_id = get_post_meta($post->ID, 'transaction_id', true);
        $status = get_post_meta($post->ID, 'payment_status', true);
        $next_payment = get_post_meta($post->ID, 'next_payment_date', true);
        
        if (!isset($recId_data[$recId])) {
            $recId_data[$recId] = [
                'canonical_post' => null,
                'has_real_charge' => false,
                'newest_status' => $status,
                'next_payment' => $next_payment,
            ];
        }
        
        // If this post has transaction_id, it's a real charge - use as canonical
        if (!empty($txn_id) && !$recId_data[$recId]['has_real_charge']) {
            $recId_data[$recId]['canonical_post'] = $post;
            $recId_data[$recId]['has_real_charge'] = true;
            $recId_data[$recId]['newest_status'] = $status;
            $recId_data[$recId]['next_payment'] = $next_payment;
        }
        // If no real charge yet, use first (newest) post
        elseif (!$recId_data[$recId]['canonical_post']) {
            $recId_data[$recId]['canonical_post'] = $post;
        }
    }

    // Categorize by status
    $active_list = [];
    $paused_list = [];
    $cancelled_count = 0;
    $monthly_recurring_revenue = 0;

    foreach ($recId_data as $recId => $data) {
        $post = $data['canonical_post'];
        if (!$post) continue;
        
        $post_id = $post->ID;
        $status = get_post_meta($post_id, 'payment_status', true);
        $next_payment = get_post_meta($post_id, 'next_payment_date', true);
        $retry_count = intval(get_post_meta($post_id, 'retry_count', true));
        $amount = floatval(get_post_meta($post_id, 'amount', true));
        $has_txn = $data['has_real_charge'];

        if ($status === 'Cancelled') {
            $cancelled_count++;
        } elseif ($status === 'Succeeded' && !empty($next_payment) && $has_txn) {
            // Active donor: has real charge + next payment date
            $monthly_recurring_revenue += $amount;
        $active_list[] = [
            'id' => $post_id,
            'name' => get_post_meta($post_id, 'name', true),
            'email' => get_post_meta($post_id, 'email', true),
            'amount' => $amount,
                'next_payment' => $next_payment,
            'created_date' => get_the_date('Y-m-d', $post_id),
        ];
        } elseif ($status === 'Failed' || $retry_count > 0) {
            // Paused/failing donor
            $paused_list[] = [
                'id' => $post_id,
                'name' => get_post_meta($post_id, 'name', true),
                'email' => get_post_meta($post_id, 'email', true),
                'amount' => $amount,
                'next_retry' => $next_payment,
                'retry_count' => $retry_count,
            ];
        }
    }

    $active_count = count($active_list);
    $paused_count = count($paused_list);
    $total_recurring = $active_count + $cancelled_count + $paused_count;

    return new WP_REST_Response([
        'active_count' => $active_count,
        'cancelled_count' => $cancelled_count,
        'paused_count' => $paused_count,
        'failing_count' => $paused_count, // Alias for backwards compatibility
        'monthly_recurring_revenue' => round($monthly_recurring_revenue, 2),
        'churn_rate' => $total_recurring > 0
            ? round(($cancelled_count / $total_recurring) * 100, 2)
            : 0,
        'active_donors' => $active_list,
        'paused_donors' => $paused_list,
    ], 200);
}

/**
 * Get failure analysis
 */
function get_failure_analysis($request)
{
    $failed = new WP_Query([
        'post_type' => 'donation',
        'posts_per_page' => -1,
        'meta_query' => [
            ['key' => 'payment_status', 'value' => 'Failed']
        ],
    ]);

    $failure_reasons = [
        'one_time_failed' => 0,
        'recurring_failed' => 0,
        'retry_1' => 0,
        'retry_2' => 0,
        'retry_3' => 0,
        'cancelled_after_retries' => 0,
    ];

    $failed_list = [];

    foreach ($failed->posts as $post) {
        $post_id = $post->ID;
        $type = get_post_meta($post_id, 'payment_type', true);
        $retry_count = intval(get_post_meta($post_id, 'retry_count', true));

        if ($type === 'Recurring') {
            $failure_reasons['recurring_failed']++;
            if ($retry_count == 1)
                $failure_reasons['retry_1']++;
            if ($retry_count == 2)
                $failure_reasons['retry_2']++;
            if ($retry_count == 3)
                $failure_reasons['retry_3']++;
        } else {
            $failure_reasons['one_time_failed']++;
        }

        $failed_list[] = [
            'id' => $post_id,
            'name' => get_post_meta($post_id, 'name', true),
            'email' => get_post_meta($post_id, 'email', true),
            'amount' => floatval(get_post_meta($post_id, 'amount', true)),
            'type' => $type,
            'retry_count' => $retry_count,
            'failed_date' => get_the_date('Y-m-d H:i:s', $post_id),
            'status_updated' => get_post_meta($post_id, 'payment_status_updated_at', true),
        ];
    }

    // Cancelled after max retries
    $cancelled_after_retries = new WP_Query([
        'post_type' => 'donation',
        'posts_per_page' => -1,
        'meta_query' => [
            'relation' => 'AND',
            ['key' => 'payment_status', 'value' => 'Cancelled'],
            ['key' => 'retry_count', 'value' => 3, 'compare' => '>='],
        ],
    ]);

    $failure_reasons['cancelled_after_retries'] = $cancelled_after_retries->found_posts;

    return new WP_REST_Response([
        'total_failed' => $failed->found_posts,
        'failure_breakdown' => $failure_reasons,
        'failed_donations' => $failed_list,
    ], 200);
}

/**
 * Get donations list with filters
 */
function get_donations_list($request)
{
    $page = intval($request->get_param('page')) ?: 1;
    $per_page = intval($request->get_param('per_page')) ?: 20;
    $status = $request->get_param('status'); // Succeeded, Failed, Pending, Cancelled
    $type = $request->get_param('type'); // One-Time, Recurring
    $search = $request->get_param('search');
    $date_from = $request->get_param('date_from');
    $date_to = $request->get_param('date_to');

    $args = [
        'post_type' => 'donation',
        'posts_per_page' => $per_page,
        'paged' => $page,
        'orderby' => 'date',
        'order' => 'DESC',
    ];

    $meta_query = ['relation' => 'AND'];

    if ($status) {
        $meta_query[] = ['key' => 'payment_status', 'value' => $status];
    }

    if ($type) {
        $meta_query[] = ['key' => 'payment_type', 'value' => $type];
    }

    if (count($meta_query) > 1) {
        $args['meta_query'] = $meta_query;
    }

    if ($date_from || $date_to) {
        $date_query = [];
        if ($date_from) {
            $date_query['after'] = $date_from;
        }
        if ($date_to) {
            $date_query['before'] = $date_to;
            $date_query['inclusive'] = true;
        }
        $args['date_query'] = [$date_query];
    }

    $query = new WP_Query($args);

    $donations = [];
    foreach ($query->posts as $post) {
        $post_id = $post->ID;
        $donations[] = [
            'id' => $post_id,
            'name' => get_post_meta($post_id, 'name', true),
            'email' => get_post_meta($post_id, 'email', true),
            'phone' => get_post_meta($post_id, 'phone', true),
            'amount' => floatval(get_post_meta($post_id, 'amount', true)),
            'payment_status' => get_post_meta($post_id, 'payment_status', true),
            'payment_type' => get_post_meta($post_id, 'payment_type', true),
            'transaction_id' => get_post_meta($post_id, 'transaction_id', true),
            'recId' => get_post_meta($post_id, 'recId', true),
            'retry_count' => intval(get_post_meta($post_id, 'retry_count', true)),
            'next_payment_date' => get_post_meta($post_id, 'next_payment_date', true),
            'created_date' => get_the_date('Y-m-d H:i:s', $post_id),
            'status_updated_at' => get_post_meta($post_id, 'payment_status_updated_at', true),
        ];
    }

    return new WP_REST_Response([
        'donations' => $donations,
        'total' => $query->found_posts,
        'pages' => $query->max_num_pages,
        'current_page' => $page,
        'per_page' => $per_page,
    ], 200);
}

/**
 * Export donations data as JSON
 */
function export_donations_data($request)
{
    $status = $request->get_param('status');
    $type = $request->get_param('type');

    $args = [
        'post_type' => 'donation',
        'posts_per_page' => -1,
        'orderby' => 'date',
        'order' => 'DESC',
    ];

    $meta_query = ['relation' => 'AND'];

    if ($status) {
        $meta_query[] = ['key' => 'payment_status', 'value' => $status];
    }

    if ($type) {
        $meta_query[] = ['key' => 'payment_type', 'value' => $type];
    }

    if (count($meta_query) > 1) {
        $args['meta_query'] = $meta_query;
    }

    $query = new WP_Query($args);

    $donations = [];
    foreach ($query->posts as $post) {
        $post_id = $post->ID;
        $donations[] = [
            'id' => $post_id,
            'name' => get_post_meta($post_id, 'name', true),
            'email' => get_post_meta($post_id, 'email', true),
            'phone' => get_post_meta($post_id, 'phone', true),
            'amount' => floatval(get_post_meta($post_id, 'amount', true)),
            'payment_status' => get_post_meta($post_id, 'payment_status', true),
            'payment_type' => get_post_meta($post_id, 'payment_type', true),
            'transaction_id' => get_post_meta($post_id, 'transaction_id', true),
            'recId' => get_post_meta($post_id, 'recId', true),
            'retry_count' => intval(get_post_meta($post_id, 'retry_count', true)),
            'next_payment_date' => get_post_meta($post_id, 'next_payment_date', true),
            'created_date' => get_the_date('Y-m-d H:i:s', $post_id),
            'status_updated_at' => get_post_meta($post_id, 'payment_status_updated_at', true),
        ];
    }

    return new WP_REST_Response([
        'data' => $donations,
        'total' => count($donations),
        'exported_at' => current_time('Y-m-d H:i:s'),
    ], 200);
}

/**
 * Helper function to generate date query args
 */
function get_date_query_args($timeframe)
{
    $date_query = [];

    switch ($timeframe) {
        case 'week':
            $date_query = [['after' => '1 week ago']];
            break;
        case 'month':
            $date_query = [['after' => '1 month ago']];
            break;
        case 'year':
            $date_query = [['after' => '1 year ago']];
            break;
        default:
            $date_query = [];
    }

    return $date_query;
}

// Register News Post Type (ამბები)
function create_news_post_type() {
    $labels = array(
        'name'                  => _x('News', 'Post Type General Name', 'textdomain'),
        'singular_name'         => _x('News Item', 'Post Type Singular Name', 'textdomain'),
        'menu_name'             => __('ამბები (News)', 'textdomain'),
        'name_admin_bar'        => __('News', 'textdomain'),
        'archives'              => __('News Archives', 'textdomain'),
        'attributes'            => __('News Attributes', 'textdomain'),
        'parent_item_colon'     => __('Parent News:', 'textdomain'),
        'all_items'             => __('All News', 'textdomain'),
        'add_new_item'          => __('Add New News', 'textdomain'),
        'add_new'               => __('Add New', 'textdomain'),
        'new_item'              => __('New News', 'textdomain'),
        'edit_item'             => __('Edit News', 'textdomain'),
        'update_item'           => __('Update News', 'textdomain'),
        'view_item'             => __('View News', 'textdomain'),
        'view_items'            => __('View News', 'textdomain'),
        'search_items'          => __('Search News', 'textdomain'),
        'not_found'             => __('Not found', 'textdomain'),
        'not_found_in_trash'    => __('Not found in Trash', 'textdomain'),
    );
    
    $args = array(
        'label'                 => __('News', 'textdomain'),
        'description'           => __('News items for the homepage', 'textdomain'),
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'),
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 5,
        'menu_icon'             => 'dashicons-megaphone',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
        'rest_base'             => 'news',
    );
    
    register_post_type('news', $args);
}
add_action('init', 'create_news_post_type', 0);

// Add ACF fields for News
function add_news_acf_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_news',
            'title' => 'News Details',
            'fields' => array(
                array(
                    'key' => 'field_news_description',
                    'label' => 'Short Description / მოკლე აღწერა',
                    'name' => 'description',
                    'type' => 'textarea',
                    'instructions' => 'Short description to show on the news card (max 200 characters recommended)',
                    'required' => 1,
                    'rows' => 4,
                    'maxlength' => 250,
                ),
                array(
                    'key' => 'field_news_author',
                    'label' => 'Author / ავტორი',
                    'name' => 'author',
                    'type' => 'text',
                    'instructions' => 'Author name for this news item',
                    'required' => 1,
                    'default_value' => '',
                    'placeholder' => 'Enter author name',
                ),
                array(
                    'key' => 'field_news_image',
                    'label' => 'Cover Image / გარეკანის სურათი',
                    'name' => 'image',
                    'type' => 'image',
                    'instructions' => 'Main image for the news article (recommended size: 1200x630px). Required for all news.',
                    'required' => 1,
                    'return_format' => 'url',
                    'preview_size' => 'medium',
                    'library' => 'all',
                ),
                array(
                    'key' => 'field_news_video_url',
                    'label' => 'Video URL / ვიდეოს ბმული (არასავალდებულო)',
                    'name' => 'video_url',
                    'type' => 'url',
                    'instructions' => 'Optional YouTube video URL. Leave empty if this news has no video.',
                    'required' => 0,
                    'default_value' => '',
                    'placeholder' => 'https://www.youtube.com/watch?v=...',
                ),
                array(
                    'key' => 'field_news_main_text',
                    'label' => 'Main Text / მთავარი ტექსტი',
                    'name' => 'main_text',
                    'type' => 'wysiwyg',
                    'instructions' => 'Full content of the news article',
                    'required' => 1,
                    'default_value' => '',
                    'tabs' => 'all',
                    'toolbar' => 'full',
                    'media_upload' => 1,
                    'delay' => 0,
                ),
                array(
                    'key' => 'field_news_tags',
                    'label' => 'Tags / თეგები (არასავალდებულო)',
                    'name' => 'tags',
                    'type' => 'text',
                    'instructions' => 'Optional comma-separated tags for filtering/search (e.g. "politics, economy, breaking")',
                    'required' => 0,
                    'default_value' => '',
                    'placeholder' => 'tag1, tag2, tag3',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'news',
                    ),
                ),
            ),

            // Layout settings
            'position' => 'normal',   // Show below the main content editor
            'style'    => 'default',  // Keep standard styling
            'active'   => true,
            'show_in_rest' => 1,      // IMPORTANT: Enable REST API for frontend
        ));
    }
}
add_action('acf/init', 'add_news_acf_fields');

// Register REST API endpoint for news
function register_news_rest_endpoint() {
    register_rest_route('custom/v1', '/news', array(
        'methods' => 'GET',
        'callback' => 'get_all_news_with_acf',
        'permission_callback' => '__return_true',
    ));
    
    register_rest_route('custom/v1', '/news/(?P<slug>.+)', array(
        'methods' => 'GET',
        'callback' => 'get_single_news_by_slug',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'register_news_rest_endpoint');

// Get all news with ACF fields
function get_all_news_with_acf(WP_REST_Request $request) {
    $per_page = $request->get_param('per_page') ? intval($request->get_param('per_page')) : 20;
    $page = $request->get_param('page') ? intval($request->get_param('page')) : 1;
    
    $args = array(
        'post_type' => 'news',
        'posts_per_page' => $per_page,
        'paged' => $page,
        'post_status' => 'publish',
        'orderby' => 'date',
        'order' => 'DESC',
    );
    
    $query = new WP_Query($args);
    $news_items = array();
    
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $post_id = get_the_ID();
            
            $news_items[] = array(
                'id' => $post_id,
                'title' => get_the_title(),
                'slug' => get_post_field('post_name', $post_id),
                'date' => get_the_date('Y-m-d'),
                'excerpt' => get_the_excerpt(),
                'acf' => array(
                    'description' => get_field('description', $post_id),
                    'author' => get_field('author', $post_id),
                    'image' => get_field('image', $post_id),
                    'video_url' => get_field('video_url', $post_id),
                    'main_text' => get_field('main_text', $post_id),
                    'tags' => get_field('tags', $post_id),
                ),
            );
        }
    }
    
    wp_reset_postdata();
    
    return rest_ensure_response(array(
        'news' => $news_items,
        'total' => $query->found_posts,
        'total_pages' => $query->max_num_pages,
        'current_page' => $page,
    ));
}

// Get single news by slug
function get_single_news_by_slug(WP_REST_Request $request) {
    $slug = urldecode($request->get_param('slug'));
    
    $args = array(
        'post_type' => 'news',
        'name' => $slug,
        'posts_per_page' => 1,
        'post_status' => 'publish',
    );
    
    $query = new WP_Query($args);
    
    if (!$query->have_posts()) {
        return new WP_Error('news_not_found', 'News item not found', array('status' => 404));
    }
    
    $query->the_post();
    $post_id = get_the_ID();
    
    $news_item = array(
        'id' => $post_id,
        'title' => get_the_title(),
        'slug' => get_post_field('post_name', $post_id),
        'date' => get_the_date('Y-m-d'),
        'excerpt' => get_the_excerpt(),
        'content' => apply_filters('the_content', get_the_content()),
        'acf' => array(
            'description' => get_field('description', $post_id),
            'author' => get_field('author', $post_id),
            'image' => get_field('image', $post_id),
            'video_url' => get_field('video_url', $post_id),
            'main_text' => get_field('main_text', $post_id),
            'tags' => get_field('tags', $post_id),
        ),
    );
    
    wp_reset_postdata();
    
    return rest_ensure_response($news_item);
}


// 🔧 Optional: Disable Gutenberg for this post type
add_filter('use_block_editor_for_post_type', function($use_block_editor, $post_type) {
    if ($post_type === 'news') {
        return false; // use classic editor for News
    }
    return $use_block_editor;
}, 10, 2);

function remove_news_meta_boxes() {
    remove_meta_box('postexcerpt', 'news', 'normal'); // Excerpt box
    remove_meta_box('slugdiv', 'news', 'normal');     // Slug box
    remove_meta_box('authordiv', 'news', 'normal');   // Author (if visible)
    remove_meta_box('revisionsdiv', 'news', 'normal');// Revisions (optional)
}
add_action('add_meta_boxes', 'remove_news_meta_boxes', 20);


// ============================================================================
// DONATION CLEANUP MIGRATION TOOL - Added to prevent double-charging
// ============================================================================

/**
 * Migration tool to clean up historical/backfilled donation posts.
 * 
 * This function:
 * - Finds all recurring donation posts grouped by recId
 * - For each recId, identifies the "canonical" active post (newest with valid next_payment_date)
 * - Marks all other posts as historical (clears next_payment_date, sets is_historical=1)
 * - Does NOT delete any posts
 * 
 * USAGE:
 * - Dry run: msb_cleanup_historical_donations(true)
 * - Real run: msb_cleanup_historical_donations(false)
 * 
 * You can call this from:
 * - WP-CLI: wp eval 'msb_cleanup_historical_donations(true);'
 * - Admin page: Tools → Donation Cleanup
 * 
 * @param bool $dry_run If true, only logs what would be done. If false, actually makes changes.
 * @return array Summary of actions taken/would be taken
 */
function msb_cleanup_historical_donations($dry_run = true)
{
    // Security check - only admins can run this
    if (!current_user_can('administrator') && !defined('WP_CLI')) {
        error_log('[MIGRATION] Access denied: only administrators can run cleanup');
        return array('error' => 'Access denied');
    }

    error_log(sprintf('[MIGRATION] Starting cleanup... DRY_RUN=%s', $dry_run ? 'YES' : 'NO'));

    // Step 1: Get ALL recurring donation posts (including those with NULL next_payment_date)
    $args = array(
        'post_type'      => 'donation',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'orderby'        => 'ID',
        'order'          => 'DESC',  // Newest first
        'meta_query'     => array(
            'relation' => 'AND',
            array(
                'key'     => 'payment_type',
                'value'   => 'Recurring',
                'compare' => '='
            ),
            array(
                'key'     => 'recId',
                'compare' => 'EXISTS'
            ),
            array(
                'key'     => 'recId',
                'value'   => '',
                'compare' => '!='
            ),
        ),
    );

    $query = new WP_Query($args);
    
    // Group posts by recId
    $posts_by_recId = array();
    
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $post_id = get_the_ID();
            $recId = get_post_meta($post_id, 'recId', true);
            $next_payment_date = get_post_meta($post_id, 'next_payment_date', true);
            $email = get_post_meta($post_id, 'email', true);
            $payment_status = get_post_meta($post_id, 'payment_status', true);
            $transaction_id = get_post_meta($post_id, 'transaction_id', true);
            
            if (!isset($posts_by_recId[$recId])) {
                $posts_by_recId[$recId] = array();
            }
            
            $posts_by_recId[$recId][] = array(
                'post_id'           => $post_id,
                'next_payment_date' => $next_payment_date,
                'email'             => $email,
                'payment_status'    => $payment_status,
                'transaction_id'    => $transaction_id,
                'post_date'         => get_the_date('Y-m-d H:i:s'),
            );
        }
        wp_reset_postdata();
    }

    error_log(sprintf('[MIGRATION] Found %d unique recIds with %d total posts',
        count($posts_by_recId),
        $query->found_posts
    ));

    // Step 2: Process each recId group
    $summary = array(
        'total_recIds'       => count($posts_by_recId),
        'total_posts'        => $query->found_posts,
        'canonical_posts'    => 0,
        'historical_posts'   => 0,
        'already_historical' => 0,
        'updated_posts'      => array(),
        'dry_run'            => $dry_run,
    );

    foreach ($posts_by_recId as $recId => $posts) {
        // Sort posts: prefer those with valid next_payment_date, then by newest
        usort($posts, function($a, $b) {
            // Posts with valid next_payment_date come first
            $a_has_date = !empty($a['next_payment_date']);
            $b_has_date = !empty($b['next_payment_date']);
            
            if ($a_has_date && !$b_has_date) return -1;
            if (!$a_has_date && $b_has_date) return 1;
            
            // If both have or don't have dates, sort by post_id DESC (newest first)
            return $b['post_id'] - $a['post_id'];
        });

        // First post is the canonical one
        $canonical = array_shift($posts);
        $summary['canonical_posts']++;
        
        error_log(sprintf(
            '[MIGRATION] recId %s: Canonical post ID %d (email: %s, next_payment_date: %s)',
            $recId,
            $canonical['post_id'],
            $canonical['email'],
            $canonical['next_payment_date'] ?: 'NULL'
        ));

        // Mark all other posts as historical
        foreach ($posts as $historical) {
            $post_id = $historical['post_id'];
            
            // Check if already marked as historical
            $is_historical = get_post_meta($post_id, 'is_historical', true);
            if ($is_historical === '1') {
                $summary['already_historical']++;
                continue;
            }

            $summary['historical_posts']++;
            
            error_log(sprintf(
                '[MIGRATION] %s: Mark post ID %d as historical (recId: %s, next_payment_date was: %s)',
                $dry_run ? '[DRY RUN]' : '[REAL]',
                $post_id,
                $recId,
                $historical['next_payment_date'] ?: 'NULL'
            ));

            if (!$dry_run) {
                // Clear next_payment_date to prevent any future charging
                delete_post_meta($post_id, 'next_payment_date');
                
                // Mark as historical
                update_post_meta($post_id, 'is_historical', '1');
                
                // Add a note about when this was cleaned up
                update_post_meta($post_id, 'marked_historical_date', current_time('mysql'));
                update_post_meta($post_id, 'historical_reason', 'Duplicate recId - cleaned up by migration');
                
                $summary['updated_posts'][] = $post_id;
            }
        }
    }

    // Log summary
    error_log(sprintf(
        '[MIGRATION] Complete! Summary: %d recIds, %d canonical posts kept, %d posts marked historical, %d already historical',
        $summary['total_recIds'],
        $summary['canonical_posts'],
        $summary['historical_posts'],
        $summary['already_historical']
    ));

    return $summary;
}


// ============================================================================
// END OF DONATION CLEANUP MIGRATION TOOL
// ============================================================================

// ============================================================================
// NOVEMBER 2025 BACKFILL TOOL (Admin Page)
// Access via: WordPress Admin → Tools → November Backfill
// ============================================================================

add_action('admin_menu', 'msb_register_november_backfill_page');

function msb_register_november_backfill_page() {
    add_management_page(
        'November Backfill',
        'November Backfill',
        'manage_options',
        'november-backfill',
        'msb_render_november_backfill_page'
    );
}

function msb_render_november_backfill_page() {
    if (!current_user_can('manage_options')) {
        wp_die('Access denied');
    }
    
    // SAFETY: Check if backfills are disabled
    if (defined('MSB_BACKFILL_DISABLED') && MSB_BACKFILL_DISABLED) {
        echo '<div class="wrap">';
        echo '<h1>🚫 Backfill Tool Disabled</h1>';
        echo '<div class="notice notice-error"><p><strong>This tool has been disabled for safety.</strong></p>';
        echo '<p>To re-enable, set MSB_BACKFILL_DISABLED to false in functions.php</p></div>';
        echo '</div>';
        return;
    }
    
    $action = isset($_GET['do_action']) ? sanitize_text_field($_GET['do_action']) : 'info';
    $confirm = isset($_GET['confirm']) ? sanitize_text_field($_GET['confirm']) : '';
    
    echo '<div class="wrap">';
    echo '<h1>🗓️ November 2025 Backfill Tool</h1>';
    
    // Get candidates
    $candidates = msb_get_november_backfill_candidates();
    $to_create = [];
    $skipped = [];
    $total_amount = 0;
    
    foreach ($candidates as $donor) {
        if (msb_november_backfill_exists($donor->recId)) {
            $skipped[] = $donor;
        } else {
            $to_create[] = $donor;
            $total_amount += floatval($donor->amount);
        }
    }
    
    echo '<div class="notice notice-info"><p>';
    echo '<strong>Total candidates:</strong> ' . count($candidates) . '<br>';
    echo '<strong>Already backfilled:</strong> ' . count($skipped) . '<br>';
    echo '<strong>To create:</strong> ' . count($to_create) . '<br>';
    echo '<strong>Amount to add:</strong> ' . number_format($total_amount, 2) . ' GEL';
    echo '</p></div>';
    
    if ($action === 'execute' && $confirm === 'yes' && count($to_create) > 0) {
        $created = 0;
        foreach ($to_create as $donor) {
            $post_id = wp_insert_post([
                'post_title' => sprintf('Monthly Donation from %s - 2025-11-01', $donor->name),
                'post_type' => 'donation',
                'post_status' => 'publish',
                'post_date' => '2025-11-01 00:00:00',
                'post_date_gmt' => '2025-11-01 00:00:00',
            ]);
            
            if ($post_id && !is_wp_error($post_id)) {
                update_post_meta($post_id, 'name', $donor->name);
                update_post_meta($post_id, 'email', $donor->email);
                update_post_meta($post_id, 'amount', $donor->amount);
                update_post_meta($post_id, 'phone', $donor->phone);
                update_post_meta($post_id, 'recId', $donor->recId);
                update_post_meta($post_id, 'payment_type', 'Recurring');
                update_post_meta($post_id, 'payment_status', 'Succeeded');
                update_post_meta($post_id, 'is_backfill', '1');
                update_post_meta($post_id, 'is_historical', '1');
                // NO next_payment_date - won't be picked up by cron
                // NO transaction_id - marked as backfill
                $created++;
            }
        }
        echo '<div class="notice notice-success"><p>✅ Created ' . $created . ' backfill posts!</p></div>';
        
        // Refresh data
        $to_create = [];
        $total_amount = 0;
    }
    
    if (count($to_create) > 0) {
        echo '<h2>Posts to Create</h2>';
        echo '<table class="wp-list-table widefat fixed striped">';
        echo '<thead><tr><th>Name</th><th>Email</th><th>Amount</th></tr></thead><tbody>';
        foreach (array_slice($to_create, 0, 20) as $donor) {
            echo '<tr><td>' . esc_html($donor->name) . '</td>';
            echo '<td>' . esc_html($donor->email) . '</td>';
            echo '<td>' . esc_html($donor->amount) . ' GEL</td></tr>';
        }
        if (count($to_create) > 20) {
            echo '<tr><td colspan="3">... and ' . (count($to_create) - 20) . ' more</td></tr>';
        }
        echo '</tbody></table>';
        
        $execute_url = admin_url('tools.php?page=november-backfill&do_action=execute&confirm=yes');
        echo '<p><a href="' . esc_url($execute_url) . '" class="button button-primary" onclick="return confirm(\'Create ' . count($to_create) . ' backfill posts?\');">⚡ Execute Backfill</a></p>';
    } else {
        echo '<div class="notice notice-success"><p>✅ November backfill complete! No posts to create.</p></div>';
    }
    
    echo '</div>';
}

function msb_get_november_backfill_candidates() {
    global $wpdb;
    
    return $wpdb->get_results("
        SELECT 
            p.ID as original_post_id,
            name.meta_value as name,
            email.meta_value as email,
            amount.meta_value as amount,
            recId.meta_value as recId,
            phone.meta_value as phone
        FROM {$wpdb->posts} p
        INNER JOIN {$wpdb->postmeta} type ON type.post_id = p.ID 
            AND type.meta_key = 'payment_type' AND type.meta_value = 'Recurring'
        INNER JOIN {$wpdb->postmeta} status ON status.post_id = p.ID 
            AND status.meta_key = 'payment_status' AND status.meta_value = 'Succeeded'
        INNER JOIN {$wpdb->postmeta} recId ON recId.post_id = p.ID 
            AND recId.meta_key = 'recId' AND recId.meta_value != ''
        LEFT JOIN {$wpdb->postmeta} name ON name.post_id = p.ID AND name.meta_key = 'name'
        LEFT JOIN {$wpdb->postmeta} email ON email.post_id = p.ID AND email.meta_key = 'email'
        LEFT JOIN {$wpdb->postmeta} amount ON amount.post_id = p.ID AND amount.meta_key = 'amount'
        LEFT JOIN {$wpdb->postmeta} phone ON phone.post_id = p.ID AND phone.meta_key = 'phone'
        WHERE p.post_type = 'donation'
          AND p.post_status = 'publish'
          AND p.post_date < '2025-11-01'
          AND p.ID = (
              SELECT MAX(p2.ID) FROM {$wpdb->posts} p2
              INNER JOIN {$wpdb->postmeta} r2 ON r2.post_id = p2.ID 
                  AND r2.meta_key = 'recId' AND r2.meta_value = recId.meta_value
              INNER JOIN {$wpdb->postmeta} s2 ON s2.post_id = p2.ID 
                  AND s2.meta_key = 'payment_status' AND s2.meta_value = 'Succeeded'
              WHERE p2.post_type = 'donation' AND p2.post_status = 'publish'
                AND p2.post_date < '2025-11-01'
          )
    ");
}

function msb_november_backfill_exists($recId) {
    global $wpdb;
    return $wpdb->get_var($wpdb->prepare("
        SELECT COUNT(*) FROM {$wpdb->posts} p
        INNER JOIN {$wpdb->postmeta} r ON r.post_id = p.ID AND r.meta_key = 'recId' AND r.meta_value = %s
        INNER JOIN {$wpdb->postmeta} h ON h.post_id = p.ID AND h.meta_key = 'is_backfill' AND h.meta_value = '1'
        WHERE p.post_type = 'donation' AND p.post_status = 'publish'
          AND YEAR(p.post_date) = 2025 AND MONTH(p.post_date) = 11
    ", $recId)) > 0;
}

// ============================================================================
// END OF NOVEMBER BACKFILL TOOL
// ============================================================================